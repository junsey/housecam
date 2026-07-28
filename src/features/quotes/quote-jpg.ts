import { readFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import type { QuoteDocumentData } from "./quote-pdf";

const ars = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0, maximumFractionDigits: 2 });

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (character) => ({
    "<": "&lt;", ">": "&gt;", "&": "&amp;", "\"": "&quot;", "'": "&apos;",
  })[character]!);
}

async function rasterDataUrl(input: Buffer, width: number, height: number, fit: "inside" | "cover" = "inside") {
  const bytes = await sharp(input).resize({ width, height, fit, position: "centre" }).png().toBuffer();
  return `data:image/png;base64,${bytes.toString("base64")}`;
}

async function remoteImageDataUrl(url: string | null) {
  if (!url) return null;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!response.ok) return null;
    return rasterDataUrl(Buffer.from(await response.arrayBuffer()), 112, 112, "cover");
  } catch {
    return null;
  }
}

export async function buildQuoteJpg(data: QuoteDocumentData) {
  const width = 1240;
  const rowHeight = 142;
  const height = Math.max(1754, 720 + data.items.length * rowHeight);
  const logoBytes = await readFile(path.join(process.cwd(), "public", "housecam-black.svg"));
  const logo = await rasterDataUrl(logoBytes, 310, 94);
  const images = await Promise.all(data.items.map((item) => remoteImageDataUrl(item.imageUrlSnapshot)));
  const itemRows = data.items.map((item, index) => {
    const y = 570 + index * rowHeight;
    const image = images[index];
    const visual = image
      ? `<image href="${image}" x="92" y="${y + 15}" width="112" height="112" preserveAspectRatio="xMidYMid slice"/>`
      : `<rect x="92" y="${y + 15}" width="112" height="112" rx="10" fill="#eff4f7"/><text x="148" y="${y + 80}" text-anchor="middle" class="${item.kind === "product" ? "placeholder" : "service-placeholder"}">${item.kind === "product" ? "HC" : "SERVICIO"}</text>`;
    const description = item.description ?? (item.kind === "product" ? "Producto HouseCam" : "Servicio adicional");
    return `<g>
      <rect x="72" y="${y}" width="1096" height="132" rx="4" class="item-box"/>
      ${visual}
      <text x="230" y="${y + 48}" class="item-title">${escapeXml(item.label)}</text>
      <text x="230" y="${y + 79}" class="small">${escapeXml(description)}</text>
      <text x="790" y="${y + 66}" class="small">${item.quantity} x ${escapeXml(ars.format(item.unitPriceCents / 100))}</text>
      <text x="1015" y="${y + 66}" class="item-price">${escapeXml(ars.format(item.subtotalCents / 100))}</text>
    </g>`;
  }).join("");
  const totalY = 610 + data.items.length * rowHeight;
  const notes = data.quote.notes
    ? `<text x="72" y="${totalY + 165}" class="eyebrow">NOTAS</text><text x="72" y="${totalY + 198}" class="small">${escapeXml(data.quote.notes.slice(0, 180))}</text>`
    : "";
  const contact = [data.quote.customerPhone, data.quote.customerEmail].filter(Boolean).join(" · ");
  const footer = data.quote.whatsappNumberSnapshot
    ? `HouseCam · WhatsApp ${data.quote.whatsappNumberSnapshot}`
    : "HouseCam · Tecnología simple para cuidar lo que importa.";
  const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <style>
      text { font-family: Arial, Helvetica, sans-serif; fill: #0e293e; }
      .eyebrow { font-size: 20px; font-weight: 700; fill: #07578f; letter-spacing: 1px; }
      .code { font-size: 38px; font-weight: 700; }
      .customer { font-size: 34px; font-weight: 700; }
      .small { font-size: 18px; fill: #536b7c; }
      .item-title { font-size: 22px; font-weight: 700; }
      .item-price { font-size: 21px; font-weight: 700; }
      .placeholder { font-size: 27px; font-weight: 800; fill: #07578f; }
      .service-placeholder { font-size: 14px; font-weight: 800; fill: #07578f; letter-spacing: .5px; }
      .item-box { fill: #fff; stroke: #cfdae2; stroke-width: 2; }
    </style>
    <rect width="100%" height="100%" fill="#fff"/>
    <image href="${logo}" x="72" y="72" width="310" height="94" preserveAspectRatio="xMinYMid meet"/>
    <text x="828" y="92" class="eyebrow">PRESUPUESTO</text>
    <text x="828" y="139" class="code">${escapeXml(data.quote.code ?? "Presupuesto")}</text>
    <line x1="72" y1="190" x2="1168" y2="190" stroke="#cfdae2" stroke-width="2"/>
    <text x="72" y="245" class="eyebrow">PREPARADO PARA</text>
    <text x="72" y="294" class="customer">${escapeXml(data.quote.customerName)}</text>
    <text x="72" y="330" class="small">${escapeXml(contact)}</text>
    <text x="828" y="262" class="small">Fecha: ${data.quote.createdAt.toLocaleDateString("es-AR")}</text>
    <text x="828" y="298" class="small">Validez: ${data.quote.validUntil?.toLocaleDateString("es-AR") ?? "sin vencimiento"}</text>
    <text x="72" y="530" class="eyebrow">DETALLE</text>
    ${itemRows}
    <line x1="720" y1="${totalY}" x2="1168" y2="${totalY}" stroke="#cfdae2" stroke-width="2"/>
    <text x="720" y="${totalY + 65}" class="small" style="font-weight:700">TOTAL</text>
    <text x="930" y="${totalY + 65}" class="code">${escapeXml(ars.format(data.quote.totalCents / 100))}</text>
    ${notes}
    <line x1="72" y1="${height - 78}" x2="1168" y2="${height - 78}" stroke="#cfdae2" stroke-width="2"/>
    <text x="72" y="${height - 38}" class="small">${escapeXml(footer)}</text>
  </svg>`;
  const jpeg = await sharp(Buffer.from(svg))
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 91, chromaSubsampling: "4:4:4", mozjpeg: true })
    .toBuffer();
  if (jpeg[0] !== 0xff || jpeg[1] !== 0xd8 || jpeg[jpeg.length - 2] !== 0xff || jpeg[jpeg.length - 1] !== 0xd9) {
    throw new Error("La imagen generada no tiene un formato JPEG válido.");
  }
  return jpeg;
}
