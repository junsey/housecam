"use server";

import { and, eq, sql } from "drizzle-orm";
import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getDb } from "@/db";
import {
  auditLogs, kitComponents, products, purchaseRequests, saleCharges, saleExpenses, saleItemComponents, saleItems, sales, stockMovements,
} from "@/db/schema";
import { requireAdmin } from "@/features/auth/require-admin";

import { calculateSaleTotals, cancelSaleSchema, createSaleSchema, saleExpenseInputSchema, saleItemInputSchema } from "./sales.schemas";

export type CreateSaleState = { ok: boolean; error?: string };

function integer(value: FormDataEntryValue | null) {
  return Number.parseInt(String(value ?? ""), 10);
}

function pesosToCents(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim().replace(",", ".");
  if (!normalized) return undefined;
  const pesos = Number(normalized);
  return Number.isFinite(pesos) ? Math.round(pesos * 100) : undefined;
}

async function authorize() {
  if (!process.env.DATABASE_URL || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
    throw new Error("Configurá Neon y Clerk antes de operar ventas.");
  }
  return requireAdmin();
}

async function refreshTotals(tx: Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0], saleId: string) {
  const [items, expenses, charges] = await Promise.all([
    tx.select({
      listedSubtotalCents: saleItems.listedSubtotalCents,
      finalSubtotalCents: saleItems.finalSubtotalCents,
      historicalCostSubtotalCents: saleItems.historicalCostSubtotalCents,
    }).from(saleItems).where(eq(saleItems.saleId, saleId)),
    tx.select({ amountCents: saleExpenses.amountCents }).from(saleExpenses).where(eq(saleExpenses.saleId, saleId)),
    tx.select({ amountCents: saleCharges.amountCents }).from(saleCharges).where(eq(saleCharges.saleId, saleId)),
  ]);
  const totals = calculateSaleTotals(items, expenses, charges);
  await tx.update(sales).set({ ...totals, updatedAt: new Date() }).where(eq(sales.id, saleId));
  return totals;
}

export async function createSaleAction(_previousState: CreateSaleState, formData: FormData): Promise<CreateSaleState> {
  let createdId: string;
  try {
    const admin = await authorize();
    const parsed = createSaleSchema.safeParse({
      customerLabel: formData.get("customerLabel"),
      channel: formData.get("channel"),
      notes: String(formData.get("notes") ?? "").trim() || undefined,
    });
    if (!parsed.success) return { ok: false, error: "Revisá el cliente y el canal de la venta." };
    const input = parsed.data;
    const productId = String(formData.get("productId") ?? "");
    const purchaseMode = String(formData.get("purchaseMode") ?? "");
    const quantity = integer(formData.get("quantity"));
    const finalPrice = pesosToCents(formData.get("finalUnitPricePesos"));
    if (formData.get("finalUnitPricePesos") && finalPrice === undefined) return { ok: false, error: "El precio final ingresado no es válido." };
    const db = getDb();
    const created = await db.transaction(async (tx) => {
    const [product] = await tx.select().from(products).where(and(eq(products.id, productId), sql`${products.archivedAt} is null`)).limit(1);
    if (!product) throw new Error("Seleccioná un producto válido antes de crear la venta.");
    if (purchaseMode !== "unit" && purchaseMode !== "pack10") throw new Error("Seleccioná una modalidad válida.");
    if (!Number.isInteger(quantity) || quantity < 1) throw new Error("La cantidad debe ser mayor a cero.");

    const multiplier = purchaseMode === "pack10" ? 10 : 1;
    const listedUnitPriceCents = purchaseMode === "pack10" ? product.pack10PriceCents : product.unitPriceCents;
    if (listedUnitPriceCents === null) throw new Error("Este producto no tiene precio de pack de 10.");
    const finalUnitPriceCents = finalPrice ?? listedUnitPriceCents;
    let historicalUnitCostCents = product.commercialCostCents * multiplier;
    const componentSnapshots: Array<{ componentProductId: string; componentNameSnapshot: string; componentSkuSnapshot: string; physicalUnits: number; historicalUnitCostCents: number; historicalCostSubtotalCents: number }> = [];
    if (product.type === "kit") {
      const components = await tx.select({
        productId: products.id, name: products.name, sku: products.sku, cost: products.commercialCostCents, quantity: kitComponents.quantity,
      }).from(kitComponents).innerJoin(products, eq(kitComponents.componentProductId, products.id)).where(eq(kitComponents.kitProductId, product.id));
      if (!components.length) throw new Error("El kit no tiene componentes.");
      historicalUnitCostCents = components.reduce((sum, component) => sum + component.cost * component.quantity * multiplier, 0);
      componentSnapshots.push(...components.map((component) => ({
        componentProductId: component.productId,
        componentNameSnapshot: component.name,
        componentSkuSnapshot: component.sku,
        physicalUnits: component.quantity * multiplier * quantity,
        historicalUnitCostCents: component.cost,
        historicalCostSubtotalCents: component.cost * component.quantity * multiplier * quantity,
      })));
    }

    const [sale] = await tx.insert(sales).values({ ...input, createdByClerkId: admin.clerkUserId }).returning({ id: sales.id });
    const [item] = await tx.insert(saleItems).values({
      saleId: sale.id,
      productId: product.id,
      productNameSnapshot: product.name,
      skuSnapshot: product.sku,
      storefrontSnapshot: product.storefront,
      purchaseMode,
      quantity,
      physicalUnits: multiplier * quantity,
      listedUnitPriceCents,
      finalUnitPriceCents,
      historicalUnitCostCents,
      listedSubtotalCents: listedUnitPriceCents * quantity,
      finalSubtotalCents: finalUnitPriceCents * quantity,
      historicalCostSubtotalCents: historicalUnitCostCents * quantity,
    }).returning({ id: saleItems.id });
    if (componentSnapshots.length) await tx.insert(saleItemComponents).values(componentSnapshots.map((component) => ({ ...component, saleItemId: item.id })));
    await refreshTotals(tx, sale.id);
    await tx.insert(auditLogs).values({ actorClerkId: admin.clerkUserId, action: "sale.created", entityType: "sale", entityId: sale.id, after: { ...input, productId, purchaseMode, quantity } });
    return sale;
    });
    createdId = created.id;
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "No pudimos crear la venta." };
  }
  redirect(`/admin/ventas/${createdId}` as Route);
}

export async function addSaleItemAction(formData: FormData) {
  const admin = await authorize();
  const input = saleItemInputSchema.parse({
    saleId: formData.get("saleId"),
    productId: formData.get("productId"),
    purchaseMode: formData.get("purchaseMode"),
    quantity: integer(formData.get("quantity")),
    finalUnitPriceCents: pesosToCents(formData.get("finalUnitPricePesos")),
  });
  const db = getDb();
  await db.transaction(async (tx) => {
    const [sale] = await tx.select({ status: sales.status }).from(sales).where(eq(sales.id, input.saleId)).limit(1);
    if (sale?.status !== "draft") throw new Error("Solo se pueden editar ventas en borrador.");
    const [product] = await tx.select().from(products).where(and(eq(products.id, input.productId), sql`${products.archivedAt} is null`)).limit(1);
    if (!product) throw new Error("Producto inexistente.");
    const multiplier = input.purchaseMode === "pack10" ? 10 : 1;
    const listedUnitPriceCents = input.purchaseMode === "pack10" ? product.pack10PriceCents : product.unitPriceCents;
    if (listedUnitPriceCents === null) throw new Error("Este producto no tiene precio de pack de 10.");
    const finalUnitPriceCents = input.finalUnitPriceCents ?? listedUnitPriceCents;
    let historicalUnitCostCents = product.commercialCostCents * multiplier;
    const componentSnapshots: Array<{ componentProductId: string; componentNameSnapshot: string; componentSkuSnapshot: string; physicalUnits: number; historicalUnitCostCents: number; historicalCostSubtotalCents: number }> = [];
    if (product.type === "kit") {
      const components = await tx.select({
        productId: products.id, name: products.name, sku: products.sku, cost: products.commercialCostCents, quantity: kitComponents.quantity,
      }).from(kitComponents).innerJoin(products, eq(kitComponents.componentProductId, products.id)).where(eq(kitComponents.kitProductId, product.id));
      if (!components.length) throw new Error("El kit no tiene componentes.");
      historicalUnitCostCents = components.reduce((sum, component) => sum + component.cost * component.quantity * multiplier, 0);
      componentSnapshots.push(...components.map((component) => ({
        componentProductId: component.productId,
        componentNameSnapshot: component.name,
        componentSkuSnapshot: component.sku,
        physicalUnits: component.quantity * multiplier * input.quantity,
        historicalUnitCostCents: component.cost,
        historicalCostSubtotalCents: component.cost * component.quantity * multiplier * input.quantity,
      })));
    }
    const [item] = await tx.insert(saleItems).values({
      saleId: input.saleId,
      productId: product.id,
      productNameSnapshot: product.name,
      skuSnapshot: product.sku,
      storefrontSnapshot: product.storefront,
      purchaseMode: input.purchaseMode,
      quantity: input.quantity,
      physicalUnits: multiplier * input.quantity,
      listedUnitPriceCents,
      finalUnitPriceCents,
      historicalUnitCostCents,
      listedSubtotalCents: listedUnitPriceCents * input.quantity,
      finalSubtotalCents: finalUnitPriceCents * input.quantity,
      historicalCostSubtotalCents: historicalUnitCostCents * input.quantity,
    }).returning({ id: saleItems.id });
    if (componentSnapshots.length) await tx.insert(saleItemComponents).values(componentSnapshots.map((component) => ({ ...component, saleItemId: item.id })));
    await refreshTotals(tx, input.saleId);
    await tx.insert(auditLogs).values({ actorClerkId: admin.clerkUserId, action: "sale.item_added", entityType: "sale", entityId: input.saleId, metadata: { productId: input.productId, quantity: input.quantity } });
  });
  revalidatePath(`/admin/ventas/${input.saleId}`);
}

export async function removeSaleItemAction(formData: FormData) {
  const admin = await authorize();
  const saleId = String(formData.get("saleId") ?? "");
  const itemId = String(formData.get("itemId") ?? "");
  await getDb().transaction(async (tx) => {
    const [sale] = await tx.select({ status: sales.status }).from(sales).where(eq(sales.id, saleId)).limit(1);
    if (sale?.status !== "draft") throw new Error("Solo se pueden editar ventas en borrador.");
    await tx.delete(saleItemComponents).where(eq(saleItemComponents.saleItemId, itemId));
    await tx.delete(saleItems).where(and(eq(saleItems.id, itemId), eq(saleItems.saleId, saleId)));
    await refreshTotals(tx, saleId);
    await tx.insert(auditLogs).values({ actorClerkId: admin.clerkUserId, action: "sale.item_removed", entityType: "sale", entityId: saleId, metadata: { itemId } });
  });
  revalidatePath(`/admin/ventas/${saleId}`);
}

export async function addSaleExpenseAction(formData: FormData) {
  const admin = await authorize();
  const input = saleExpenseInputSchema.parse({
    saleId: formData.get("saleId"), type: formData.get("type"),
    description: String(formData.get("description") ?? "").trim() || undefined,
    amountCents: pesosToCents(formData.get("amountPesos")),
  });
  await getDb().transaction(async (tx) => {
    const [sale] = await tx.select({ status: sales.status }).from(sales).where(eq(sales.id, input.saleId)).limit(1);
    if (sale?.status !== "draft") throw new Error("Solo se pueden editar ventas en borrador.");
    await tx.insert(saleExpenses).values(input);
    await refreshTotals(tx, input.saleId);
    await tx.insert(auditLogs).values({ actorClerkId: admin.clerkUserId, action: "sale.expense_added", entityType: "sale", entityId: input.saleId, after: input });
  });
  revalidatePath(`/admin/ventas/${input.saleId}`);
}

export async function removeSaleExpenseAction(formData: FormData) {
  const admin = await authorize();
  const saleId = String(formData.get("saleId") ?? "");
  const expenseId = String(formData.get("expenseId") ?? "");
  await getDb().transaction(async (tx) => {
    const [sale] = await tx.select({ status: sales.status }).from(sales).where(eq(sales.id, saleId)).limit(1);
    if (sale?.status !== "draft") throw new Error("Solo se pueden editar ventas en borrador.");
    await tx.delete(saleExpenses).where(and(eq(saleExpenses.id, expenseId), eq(saleExpenses.saleId, saleId)));
    await refreshTotals(tx, saleId);
    await tx.insert(auditLogs).values({ actorClerkId: admin.clerkUserId, action: "sale.expense_removed", entityType: "sale", entityId: saleId, metadata: { expenseId } });
  });
  revalidatePath(`/admin/ventas/${saleId}`);
}

export async function confirmSaleAction(formData: FormData) {
  const admin = await authorize();
  const saleId = String(formData.get("saleId") ?? "");
  const db = getDb();
  await db.transaction(async (tx) => {
    const lockedSale = await tx.execute(sql`select id, status, sale_number from sales where id = ${saleId} for update`);
    const sale = lockedSale.rows[0] as { id: string; status: string; sale_number?: number } | undefined;
    if (!sale || sale.status !== "draft") throw new Error("La venta ya fue procesada.");
    const items = await tx.select().from(saleItems).where(eq(saleItems.saleId, saleId));
    if (!items.length) throw new Error("Agregá al menos un producto.");
    const storefronts = new Set(items.map((item) => item.storefrontSnapshot));
    const prefix = storefronts.size > 1 ? "MX" : items[0].storefrontSnapshot === "housepet" ? "HP" : "HC";
    const saleCode = `${prefix}-${String(sale.sale_number ?? Date.now()).padStart(6, "0")}`;
    const components = await tx.select().from(saleItemComponents).where(sql`${saleItemComponents.saleItemId} in (${sql.join(items.map((item) => sql`${item.id}`), sql`, `)})`);
    const componentsByItem = new Map<string, typeof components>();
    for (const component of components) componentsByItem.set(component.saleItemId, [...(componentsByItem.get(component.saleItemId) ?? []), component]);
    const required = new Map<string, number>();
    for (const item of items) {
      const itemComponents = componentsByItem.get(item.id) ?? [];
      if (itemComponents.length) for (const component of itemComponents) required.set(component.componentProductId!, (required.get(component.componentProductId!) ?? 0) + component.physicalUnits);
      else required.set(item.productId, (required.get(item.productId) ?? 0) + item.physicalUnits);
    }
    const ids = [...required.keys()].sort();
    const lockedProducts = await tx.execute(sql`select id, stock_on_hand, commercial_cost_cents from products where id in (${sql.join(ids.map((id) => sql`${id}`), sql`, `)}) order by id for update`);
    const productMap = new Map((lockedProducts.rows as Array<{ id: string; stock_on_hand: number; commercial_cost_cents: number }>).map((product) => [product.id, product]));
    for (const id of ids) {
      const product = productMap.get(id);
      const units = required.get(id)!;
      if (!product || Number(product.stock_on_hand) < units) throw new Error("Stock insuficiente para confirmar la venta.");
      const before = Number(product.stock_on_hand);
      const after = before - units;
      await tx.update(products).set({ stockOnHand: after, updatedAt: new Date(), updatedByClerkId: admin.clerkUserId }).where(eq(products.id, id));
      await tx.insert(stockMovements).values({ productId: id, saleId, type: "sale_out", delta: -units, stockBefore: before, stockAfter: after, actorClerkId: admin.clerkUserId });
    }
    for (const item of items) {
      const itemComponents = componentsByItem.get(item.id) ?? [];
      let subtotal = 0;
      if (itemComponents.length) {
        for (const component of itemComponents) {
          const cost = Number(productMap.get(component.componentProductId!)!.commercial_cost_cents);
          const componentSubtotal = cost * component.physicalUnits;
          subtotal += componentSubtotal;
          await tx.update(saleItemComponents).set({ historicalUnitCostCents: cost, historicalCostSubtotalCents: componentSubtotal }).where(eq(saleItemComponents.id, component.id));
        }
      } else subtotal = Number(productMap.get(item.productId)!.commercial_cost_cents) * item.physicalUnits;
      await tx.update(saleItems).set({ historicalUnitCostCents: Math.round(subtotal / item.quantity), historicalCostSubtotalCents: subtotal }).where(eq(saleItems.id, item.id));
    }
    const totals = await refreshTotals(tx, saleId);
    await tx.update(sales).set({ code: saleCode, status: "confirmed", confirmedAt: new Date(), confirmedByClerkId: admin.clerkUserId, ...totals }).where(eq(sales.id, saleId));
    await tx.insert(auditLogs).values({ actorClerkId: admin.clerkUserId, action: "sale.confirmed", entityType: "sale", entityId: saleId, after: totals });
  });
  revalidatePath("/admin/ventas");
  revalidatePath(`/admin/ventas/${saleId}`);
}

export async function discardDraftSaleAction(formData: FormData) {
  const admin = await authorize();
  const saleId = String(formData.get("saleId") ?? "");
  await getDb().transaction(async (tx) => {
    const lockedSale = await tx.execute(sql`select id, status from sales where id = ${saleId} for update`);
    const sale = lockedSale.rows[0] as { id: string; status: string } | undefined;
    if (!sale || sale.status !== "draft") throw new Error("Solo se puede descartar una venta en borrador.");
    await tx.update(sales).set({
      status: "cancelled",
      cancelledAt: new Date(),
      cancelledByClerkId: admin.clerkUserId,
      cancellationReason: "Borrador descartado antes de confirmar",
      updatedAt: new Date(),
    }).where(eq(sales.id, saleId));
    await tx.insert(auditLogs).values({
      actorClerkId: admin.clerkUserId,
      action: "sale.draft_discarded",
      entityType: "sale",
      entityId: saleId,
    });
  });
  revalidatePath("/admin/ventas");
  revalidatePath(`/admin/ventas/${saleId}`);
  redirect("/admin/ventas");
}

export async function cancelSaleAction(formData: FormData) {
  const admin = await authorize();
  const input = cancelSaleSchema.parse({ saleId: formData.get("saleId"), reason: formData.get("reason") });
  await getDb().transaction(async (tx) => {
    const lockedSale = await tx.execute(sql`select id, status, purchase_request_id from sales where id = ${input.saleId} for update`);
    const sale = lockedSale.rows[0] as { id: string; status: string; purchase_request_id: string | null } | undefined;
    if (!sale || sale.status !== "confirmed") throw new Error("Solo se pueden anular ventas confirmadas.");
    const movements = await tx.select().from(stockMovements).where(and(eq(stockMovements.saleId, input.saleId), eq(stockMovements.type, "sale_out")));
    for (const movement of movements) {
      const locked = await tx.execute(sql`select stock_on_hand from products where id = ${movement.productId} for update`);
      const before = Number((locked.rows[0] as { stock_on_hand: number }).stock_on_hand);
      const units = -movement.delta;
      await tx.update(products).set({ stockOnHand: before + units, updatedAt: new Date(), updatedByClerkId: admin.clerkUserId }).where(eq(products.id, movement.productId));
      await tx.insert(stockMovements).values({ productId: movement.productId, saleId: input.saleId, type: "sale_cancelled_return", delta: units, stockBefore: before, stockAfter: before + units, note: input.reason, actorClerkId: admin.clerkUserId });
    }
    await tx.update(sales).set({ status: "cancelled", cancelledAt: new Date(), cancelledByClerkId: admin.clerkUserId, cancellationReason: input.reason, updatedAt: new Date() }).where(eq(sales.id, input.saleId));
    if (sale.purchase_request_id) await tx.update(purchaseRequests).set({ status: "contacted", updatedAt: new Date() }).where(eq(purchaseRequests.id, sale.purchase_request_id));
    await tx.insert(auditLogs).values({ actorClerkId: admin.clerkUserId, action: "sale.cancelled", entityType: "sale", entityId: input.saleId, metadata: { reason: input.reason } });
  });
  revalidatePath("/admin/ventas");
  revalidatePath(`/admin/ventas/${input.saleId}`);
}
