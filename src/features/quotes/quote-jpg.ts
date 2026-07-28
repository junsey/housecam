import { readFile } from "node:fs/promises";
import path from "node:path";

import { parse, type Font } from "opentype.js";
import sharp from "sharp";

import type { QuoteDocumentData } from "./quote-pdf";

const ars = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0, maximumFractionDigits: 2 });
const regularFontPath = path.join(process.cwd(), "node_modules", "open-sans-fonts", "open-sans", "Regular", "OpenSans-Regular.ttf");
const boldFontPath = path.join(process.cwd(), "node_modules", "open-sans-fonts", "open-sans", "Bold", "OpenSans-Bold.ttf");

function textPath(font: Font, value: string, x: number, y: number, size: number, fill: string, anchor: "start" | "middle" | "end" = "start") {
  const safeValue = value.replace(/[\u0000-\u001f\u007f]/g, " ");
  const width = font.getAdvanceWidth(safeValue, size);
  const startX = anchor === "middle" ? x - width / 2 : anchor === "end" ? x - width : x;
  return `<path d="${font.getPath(safeValue, startX, y, size).toPathData(2)}" fill="${fill}"/>`;
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
  const [regularBytes, boldBytes] = await Promise.all([readFile(regularFontPath), readFile(boldFontPath)]);
  const regular = parse(regularBytes.buffer.slice(regularBytes.byteOffset, regularBytes.byteOffset + regularBytes.byteLength) as ArrayBuffer);
  const bold = parse(boldBytes.buffer.slice(boldBytes.byteOffset, boldBytes.byteOffset + boldBytes.byteLength) as ArrayBuffer);
  const logoBytes = await readFile(path.join(process.cwd(), "public", "housecam-black.svg"));
  const logo = await rasterDataUrl(logoBytes, 310, 94);
  const images = await Promise.all(data.items.map((item) => remoteImageDataUrl(item.imageUrlSnapshot)));
  const itemRows = data.items.map((item, index) => {
    const y = 570 + index * rowHeight;
    const image = images[index];
    const visual = image
      ? `<image href="${image}" x="92" y="${y + 15}" width="112" height="112" preserveAspectRatio="xMidYMid slice"/>`
      : `<rect x="92" y="${y + 15}" width="112" height="112" rx="10" fill="#eff4f7"/>${textPath(bold, item.kind === "product" ? "HC" : "SERVICIO", 148, y + 80, item.kind === "product" ? 27 : 14, "#07578f", "middle")}`;
    const description = item.description ?? (item.kind === "product" ? "Producto HouseCam" : "Servicio adicional");
    return `<g>
      <rect x="72" y="${y}" width="1096" height="132" rx="4" class="item-box"/>
      ${visual}
      ${textPath(bold, item.label, 230, y + 48, 22, "#0e293e")}
      ${textPath(regular, description, 230, y + 79, 18, "#536b7c")}
      ${textPath(regular, `${item.quantity} x ${ars.format(item.unitPriceCents / 100)}`, 790, y + 66, 18, "#536b7c")}
      ${textPath(bold, ars.format(item.subtotalCents / 100), 1015, y + 66, 21, "#0e293e")}
    </g>`;
  }).join("");
  const totalY = 610 + data.items.length * rowHeight;
  const notes = data.quote.notes
    ? `${textPath(bold, "NOTAS", 72, totalY + 165, 20, "#07578f")}${textPath(regular, data.quote.notes.slice(0, 180), 72, totalY + 198, 18, "#536b7c")}`
    : "";
  const contact = [data.quote.customerPhone, data.quote.customerEmail].filter(Boolean).join(" · ");
  const footer = data.quote.whatsappNumberSnapshot
    ? `HouseCam · WhatsApp ${data.quote.whatsappNumberSnapshot}`
    : "HouseCam · Tecnología simple para cuidar lo que importa.";
  const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <style>
      .item-box { fill: #fff; stroke: #cfdae2; stroke-width: 2; }
    </style>
    <rect width="100%" height="100%" fill="#fff"/>
    <image href="${logo}" x="72" y="72" width="310" height="94" preserveAspectRatio="xMinYMid meet"/>
    ${textPath(bold, "PRESUPUESTO", 828, 92, 20, "#07578f")}
    ${textPath(bold, data.quote.code ?? "Presupuesto", 828, 139, 38, "#0e293e")}
    <line x1="72" y1="190" x2="1168" y2="190" stroke="#cfdae2" stroke-width="2"/>
    ${textPath(bold, "PREPARADO PARA", 72, 245, 20, "#07578f")}
    ${textPath(bold, data.quote.customerName, 72, 294, 34, "#0e293e")}
    ${textPath(regular, contact, 72, 330, 18, "#536b7c")}
    ${textPath(regular, `Fecha: ${data.quote.createdAt.toLocaleDateString("es-AR")}`, 828, 262, 18, "#536b7c")}
    ${textPath(regular, `Validez: ${data.quote.validUntil?.toLocaleDateString("es-AR") ?? "sin vencimiento"}`, 828, 298, 18, "#536b7c")}
    ${textPath(bold, "DETALLE", 72, 530, 20, "#07578f")}
    ${itemRows}
    <line x1="720" y1="${totalY}" x2="1168" y2="${totalY}" stroke="#cfdae2" stroke-width="2"/>
    ${textPath(bold, "TOTAL", 720, totalY + 65, 18, "#536b7c")}
    ${textPath(bold, ars.format(data.quote.totalCents / 100), 930, totalY + 65, 38, "#0e293e")}
    ${notes}
    <line x1="72" y1="${height - 78}" x2="1168" y2="${height - 78}" stroke="#cfdae2" stroke-width="2"/>
    ${textPath(regular, footer, 72, height - 38, 18, "#536b7c")}
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
