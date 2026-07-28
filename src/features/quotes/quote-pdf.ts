import { readFile } from "node:fs/promises";
import path from "node:path";

import { PDFDocument, PDFFont, PDFImage, PDFPage, StandardFonts, rgb } from "pdf-lib";
import sharp from "sharp";

type QuotePdfData = {
  quote: {
    code: string | null; customerName: string; customerPhone: string | null; customerEmail: string | null;
    whatsappNumberSnapshot: string | null; notes: string | null; validUntil: Date | null; createdAt: Date; totalCents: number;
  };
  items: Array<{
    label: string; description: string | null; imageUrlSnapshot: string | null; quantity: number;
    unitPriceCents: number; subtotalCents: number; kind: string;
  }>;
};

const blue = rgb(0.035, 0.31, 0.56);
const navy = rgb(0.055, 0.16, 0.25);
const muted = rgb(0.34, 0.42, 0.48);
const border = rgb(0.84, 0.88, 0.91);
const ars = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0, maximumFractionDigits: 2 });

function wrap(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) current = candidate;
    else { if (current) lines.push(current); current = word; }
  }
  if (current) lines.push(current);
  return lines;
}

async function embedRaster(document: PDFDocument, input: Buffer): Promise<PDFImage | null> {
  try {
    const png = await sharp(input).resize({ width: 800, height: 800, fit: "inside", withoutEnlargement: true }).png().toBuffer();
    return document.embedPng(png);
  } catch { return null; }
}

async function imageFromUrl(document: PDFDocument, url: string | null) {
  if (!url) return null;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!response.ok) return null;
    return embedRaster(document, Buffer.from(await response.arrayBuffer()));
  } catch { return null; }
}

function drawHeader(page: PDFPage, logo: PDFImage, regular: PDFFont, bold: PDFFont, data: QuotePdfData) {
  page.drawImage(logo, { x: 46, y: 755, width: 155, height: 47 });
  page.drawText("PRESUPUESTO", { x: 406, y: 785, size: 10, font: bold, color: blue });
  page.drawText(data.quote.code ?? "Presupuesto", { x: 406, y: 762, size: 18, font: bold, color: navy });
  page.drawLine({ start: { x: 46, y: 738 }, end: { x: 549, y: 738 }, thickness: 1, color: border });
  page.drawText("Preparado para", { x: 46, y: 710, size: 9, font: bold, color: blue });
  page.drawText(data.quote.customerName, { x: 46, y: 688, size: 17, font: bold, color: navy });
  const details = [data.quote.customerPhone, data.quote.customerEmail].filter(Boolean).join(" · ");
  if (details) page.drawText(details, { x: 46, y: 671, size: 9, font: regular, color: muted });
  page.drawText(`Fecha: ${data.quote.createdAt.toLocaleDateString("es-AR")}`, { x: 406, y: 700, size: 9, font: regular, color: muted });
  page.drawText(`Validez: ${data.quote.validUntil?.toLocaleDateString("es-AR") ?? "sin vencimiento"}`, { x: 406, y: 683, size: 9, font: regular, color: muted });
}

export async function buildQuotePdf(data: QuotePdfData) {
  const document = await PDFDocument.create();
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const logoBytes = await readFile(path.join(process.cwd(), "public", "housecam-black.svg"));
  const logo = await embedRaster(document, logoBytes);
  if (!logo) throw new Error("No se pudo preparar el logo.");
  let page = document.addPage([595, 842]);
  drawHeader(page, logo, regular, bold, data);
  let y = 625;
  page.drawText("DETALLE", { x: 46, y: y + 15, size: 9, font: bold, color: blue });
  for (const item of data.items) {
    if (y < 120) {
      page = document.addPage([595, 842]);
      page.drawImage(logo, { x: 46, y: 770, width: 130, height: 39 });
      y = 735;
    }
    page.drawRectangle({ x: 46, y: y - 64, width: 503, height: 72, borderWidth: 1, borderColor: border, color: rgb(1, 1, 1) });
    const image = await imageFromUrl(document, item.imageUrlSnapshot);
    if (image) {
      const scale = Math.min(56 / image.width, 56 / image.height);
      page.drawImage(image, { x: 54 + (56 - image.width * scale) / 2, y: y - 56 + (56 - image.height * scale) / 2, width: image.width * scale, height: image.height * scale });
    } else {
      page.drawRectangle({ x: 54, y: y - 56, width: 56, height: 56, color: rgb(.94, .96, .97) });
      page.drawText(item.kind === "product" ? "HC" : "+", { x: 73, y: y - 28, size: 14, font: bold, color: blue });
    }
    page.drawText(item.label, { x: 122, y: y - 14, size: 11, font: bold, color: navy });
    const description = item.description ? wrap(item.description, regular, 8, 220)[0] : item.kind === "product" ? "Producto HouseCam" : "Servicio adicional";
    page.drawText(description, { x: 122, y: y - 31, size: 8, font: regular, color: muted });
    page.drawText(`${item.quantity} × ${ars.format(item.unitPriceCents / 100)}`, { x: 358, y: y - 22, size: 9, font: regular, color: muted });
    page.drawText(ars.format(item.subtotalCents / 100), { x: 455, y: y - 22, size: 10, font: bold, color: navy });
    y -= 82;
  }
  page.drawLine({ start: { x: 350, y: y }, end: { x: 549, y }, thickness: 1, color: border });
  page.drawText("TOTAL", { x: 350, y: y - 29, size: 10, font: bold, color: muted });
  page.drawText(ars.format(data.quote.totalCents / 100), { x: 435, y: y - 31, size: 17, font: bold, color: navy });
  y -= 70;
  if (data.quote.notes && y > 100) {
    page.drawText("NOTAS", { x: 46, y, size: 9, font: bold, color: blue });
    wrap(data.quote.notes, regular, 9, 500).slice(0, 5).forEach((line, index) => page.drawText(line, { x: 46, y: y - 18 - index * 13, size: 9, font: regular, color: muted }));
  }
  const footer = data.quote.whatsappNumberSnapshot ? `HouseCam · WhatsApp ${data.quote.whatsappNumberSnapshot}` : "HouseCam · Tecnología simple para cuidar lo que importa.";
  for (const currentPage of document.getPages()) {
    currentPage.drawLine({ start: { x: 46, y: 42 }, end: { x: 549, y: 42 }, thickness: 1, color: border });
    currentPage.drawText(footer, { x: 46, y: 25, size: 8, font: regular, color: muted });
  }
  return document.save();
}
