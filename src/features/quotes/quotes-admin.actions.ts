"use server";

import { and, eq, sql } from "drizzle-orm";
import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getDb } from "@/db";
import { auditLogs, kitComponents, products, quoteItems, quotes, saleCharges, saleItemComponents, saleItems, sales } from "@/db/schema";
import { requireAdmin } from "@/features/auth/require-admin";

export type QuoteActionState = { ok: boolean; error?: string };

const lineSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("product"), productId: z.string().uuid(), purchaseMode: z.enum(["unit", "pack10"]), quantity: z.number().int().positive(), unitPriceCents: z.number().int().nonnegative() }),
  z.object({ kind: z.literal("additional"), additionalType: z.enum(["installation", "shipping", "other"]), label: z.string().trim().min(2).max(120), description: z.string().trim().max(300).optional(), quantity: z.number().int().positive(), unitPriceCents: z.number().int().nonnegative() }),
]);

const quoteSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  customerPhone: z.string().trim().max(40).optional(),
  customerEmail: z.string().trim().email().optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional(),
  validUntil: z.string().optional(),
  lines: z.array(lineSchema).min(1),
});

export async function createQuoteAction(_state: QuoteActionState, formData: FormData): Promise<QuoteActionState> {
  let quoteId = "";
  try {
    const admin = await requireAdmin();
    const parsedLines = JSON.parse(String(formData.get("lines") ?? "[]"));
    const parsed = quoteSchema.safeParse({
      customerName: formData.get("customerName"),
      customerPhone: String(formData.get("customerPhone") ?? "").trim() || undefined,
      customerEmail: String(formData.get("customerEmail") ?? "").trim(),
      notes: String(formData.get("notes") ?? "").trim() || undefined,
      validUntil: String(formData.get("validUntil") ?? "") || undefined,
      lines: parsedLines,
    });
    if (!parsed.success) return { ok: false, error: "Revisá los datos y agregá al menos un ítem válido." };
    const db = getDb();
    quoteId = await db.transaction(async (tx) => {
      const settingsResult = await tx.execute(sql`select whatsapp_number from site_settings limit 1`);
      const settings = settingsResult.rows[0];
      const [created] = await tx.insert(quotes).values({
        customerName: parsed.data.customerName,
        customerPhone: parsed.data.customerPhone,
        customerEmail: parsed.data.customerEmail || null,
        notes: parsed.data.notes,
        validUntil: parsed.data.validUntil ? new Date(`${parsed.data.validUntil}T23:59:59-03:00`) : null,
        whatsappNumberSnapshot: (settings as { whatsapp_number?: string } | undefined)?.whatsapp_number ?? null,
        createdByClerkId: admin.clerkUserId,
      }).returning({ id: quotes.id, number: quotes.quoteNumber });
      let totalCents = 0;
      const rows = [];
      for (const [sortOrder, line] of parsed.data.lines.entries()) {
        if (line.kind === "additional") {
          const subtotalCents = line.quantity * line.unitPriceCents;
          totalCents += subtotalCents;
          rows.push({ quoteId: created.id, ...line, subtotalCents, sortOrder });
          continue;
        }
        const productResult = await tx.execute(sql`
          select p.*, (select pi.url from product_images pi where pi.product_id = p.id order by pi.is_cover desc, pi.sort_order asc limit 1) image_url
          from products p where p.id = ${line.productId} and p.archived_at is null limit 1
        `);
        const product = productResult.rows[0];
        if (!product) throw new Error("Uno de los productos ya no está disponible.");
        const record = product as Record<string, unknown>;
        const listed = line.purchaseMode === "pack10" ? record.pack10_price_cents : record.unit_price_cents;
        if (listed === null) throw new Error("Un producto no admite pack de 10.");
        const subtotalCents = line.quantity * line.unitPriceCents;
        totalCents += subtotalCents;
        rows.push({
          quoteId: created.id, kind: "product" as const, productId: line.productId,
          label: String(record.name), description: record.short_description ? String(record.short_description) : null,
          imageUrlSnapshot: record.image_url ? String(record.image_url) : null, skuSnapshot: String(record.sku),
          storefrontSnapshot: record.storefront as "housecam" | "housepet", purchaseMode: line.purchaseMode,
          quantity: line.quantity, unitPriceCents: line.unitPriceCents, subtotalCents, sortOrder,
        });
      }
      await tx.insert(quoteItems).values(rows);
      const code = `PRES-${String(created.number).padStart(6, "0")}`;
      await tx.update(quotes).set({ code, totalCents, updatedAt: new Date() }).where(eq(quotes.id, created.id));
      await tx.insert(auditLogs).values({ actorClerkId: admin.clerkUserId, action: "quote.created", entityType: "quote", entityId: created.id, metadata: { code, totalCents } });
      return created.id;
    });
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "No pudimos crear el presupuesto." };
  }
  revalidatePath("/admin/presupuestos");
  redirect(`/admin/presupuestos/${quoteId}` as Route);
}

export async function convertQuoteToSaleAction(formData: FormData) {
  const admin = await requireAdmin();
  const quoteId = String(formData.get("quoteId") ?? "");
  const saleId = await getDb().transaction(async (tx) => {
    const locked = await tx.execute(sql`select * from quotes where id = ${quoteId} for update`);
    const quote = locked.rows[0] as Record<string, unknown> | undefined;
    if (!quote || quote.status === "converted" || quote.status === "cancelled") throw new Error("Este presupuesto no se puede convertir.");
    const lines = await tx.select().from(quoteItems).where(eq(quoteItems.quoteId, quoteId));
    const productLines = lines.filter((line) => line.kind === "product" && line.productId);
    if (!productLines.length) throw new Error("Agregá al menos un producto antes de convertir.");
    const [sale] = await tx.insert(sales).values({
      customerLabel: String(quote.customer_name), channel: "other", status: "draft",
      customerSnapshot: { phone: quote.customer_phone, email: quote.customer_email, quoteCode: quote.code },
      notes: [quote.notes, `Originada desde ${quote.code}`].filter(Boolean).join("\n"),
      createdByClerkId: admin.clerkUserId,
    }).returning({ id: sales.id });
    let listedTotal = 0;
    let finalTotal = 0;
    let costTotal = 0;
    for (const line of productLines) {
      const [product] = await tx.select().from(products).where(and(eq(products.id, line.productId!), sql`${products.archivedAt} is null`)).limit(1);
      if (!product) throw new Error(`El producto “${line.label}” ya no está disponible.`);
      const multiplier = line.purchaseMode === "pack10" ? 10 : 1;
      const listedPrice = line.purchaseMode === "pack10" ? product.pack10PriceCents : product.unitPriceCents;
      if (listedPrice === null) throw new Error(`“${line.label}” ya no admite pack de 10.`);
      let historicalCost = product.commercialCostCents * multiplier;
      const components = product.type === "kit"
        ? await tx.select({ id: products.id, name: products.name, sku: products.sku, cost: products.commercialCostCents, quantity: kitComponents.quantity })
          .from(kitComponents).innerJoin(products, eq(kitComponents.componentProductId, products.id)).where(eq(kitComponents.kitProductId, product.id))
        : [];
      if (product.type === "kit") historicalCost = components.reduce((sum, component) => sum + component.cost * component.quantity * multiplier, 0);
      const [item] = await tx.insert(saleItems).values({
        saleId: sale.id, productId: product.id, productNameSnapshot: product.name, skuSnapshot: product.sku,
        storefrontSnapshot: product.storefront, purchaseMode: line.purchaseMode!, quantity: line.quantity,
        physicalUnits: line.quantity * multiplier, listedUnitPriceCents: listedPrice, finalUnitPriceCents: line.unitPriceCents,
        historicalUnitCostCents: historicalCost, listedSubtotalCents: listedPrice * line.quantity,
        finalSubtotalCents: line.subtotalCents, historicalCostSubtotalCents: historicalCost * line.quantity,
      }).returning({ id: saleItems.id });
      if (components.length) await tx.insert(saleItemComponents).values(components.map((component) => ({
        saleItemId: item.id, componentProductId: component.id, componentNameSnapshot: component.name,
        componentSkuSnapshot: component.sku, physicalUnits: component.quantity * multiplier * line.quantity,
        historicalUnitCostCents: component.cost, historicalCostSubtotalCents: component.cost * component.quantity * multiplier * line.quantity,
      })));
      listedTotal += listedPrice * line.quantity;
      finalTotal += line.subtotalCents;
      costTotal += historicalCost * line.quantity;
    }
    let charges = 0;
    for (const line of lines.filter((item) => item.kind === "additional")) {
      await tx.insert(saleCharges).values({ saleId: sale.id, type: line.additionalType ?? "other", description: line.label, amountCents: line.subtotalCents });
      charges += line.subtotalCents;
    }
    await tx.update(sales).set({
      listedTotalCents: listedTotal, discountTotalCents: Math.max(0, listedTotal - finalTotal),
      finalTotalCents: finalTotal + charges, productCostTotalCents: costTotal, expenseTotalCents: 0,
      profitCents: finalTotal + charges - costTotal, updatedAt: new Date(),
    }).where(eq(sales.id, sale.id));
    await tx.update(quotes).set({ status: "converted", convertedSaleId: sale.id, convertedAt: new Date(), updatedAt: new Date() }).where(eq(quotes.id, quoteId));
    await tx.insert(auditLogs).values({ actorClerkId: admin.clerkUserId, action: "quote.converted", entityType: "quote", entityId: quoteId, metadata: { saleId: sale.id } });
    return sale.id;
  });
  revalidatePath("/admin/presupuestos");
  revalidatePath("/admin/ventas");
  redirect(`/admin/ventas/${saleId}` as Route);
}

export async function deleteQuoteAction(formData: FormData) {
  const admin = await requireAdmin();
  const quoteId = z.string().uuid().parse(String(formData.get("quoteId") ?? ""));
  const result = await getDb().transaction(async (tx) => {
    const locked = await tx.execute(sql`select * from quotes where id = ${quoteId} for update`);
    const quote = locked.rows[0] as Record<string, unknown> | undefined;
    if (!quote) return "missing" as const;
    if (quote.status === "converted" || quote.converted_sale_id) return "converted" as const;

    await tx.delete(quoteItems).where(eq(quoteItems.quoteId, quoteId));
    await tx.delete(quotes).where(eq(quotes.id, quoteId));
    await tx.insert(auditLogs).values({
      actorClerkId: admin.clerkUserId,
      action: "quote.deleted",
      entityType: "quote",
      entityId: quoteId,
      metadata: {
        code: quote.code,
        customerName: quote.customer_name,
        status: quote.status,
        totalCents: quote.total_cents,
      },
    });
    return "deleted" as const;
  });

  if (result === "converted") {
    redirect(`/admin/presupuestos/${quoteId}?error=converted` as Route);
  }
  if (result === "missing") {
    redirect("/admin/presupuestos?error=missing" as Route);
  }
  revalidatePath("/admin/presupuestos");
  redirect("/admin/presupuestos?eliminado=1" as Route);
}
