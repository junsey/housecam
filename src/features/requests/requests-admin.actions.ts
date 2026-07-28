"use server";

import { and, eq } from "drizzle-orm";
import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getDb } from "@/db";
import {
  auditLogs, kitComponents, products, purchaseRequestItems, purchaseRequests, saleItemComponents, saleItems, sales,
} from "@/db/schema";
import { requireAdmin } from "@/features/auth/require-admin";

async function authorize() {
  if (!process.env.DATABASE_URL) throw new Error("La base no está configurada.");
  return requireAdmin();
}

export async function updatePurchaseRequestStatusAction(formData: FormData) {
  const admin = await authorize();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["new", "contacted", "discarded"].includes(status)) throw new Error("Estado inválido.");
  await getDb().transaction(async (tx) => {
    await tx.update(purchaseRequests).set({
      status: status as "new" | "contacted" | "discarded",
      updatedAt: new Date(),
    }).where(eq(purchaseRequests.id, id));
    await tx.insert(auditLogs).values({ actorClerkId: admin.clerkUserId, action: "purchase_request.status_changed", entityType: "purchase_request", entityId: id, metadata: { status } });
  });
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
}

export async function convertPurchaseRequestToSaleAction(formData: FormData) {
  const admin = await authorize();
  const requestId = String(formData.get("id") ?? "");
  const saleId = await getDb().transaction(async (tx) => {
    const [request] = await tx.select().from(purchaseRequests).where(eq(purchaseRequests.id, requestId)).limit(1);
    if (!request || !["new", "contacted"].includes(request.status)) throw new Error("Este pedido ya fue procesado.");
    const requestItems = await tx.select().from(purchaseRequestItems).where(eq(purchaseRequestItems.purchaseRequestId, requestId));
    if (!requestItems.length) throw new Error("El pedido no contiene productos.");
    const [sale] = await tx.insert(sales).values({
      purchaseRequestId: request.id,
      customerSnapshot: request.customerSnapshot,
      customerLabel: request.customerName,
      channel: "web_request",
      status: "draft",
      listedTotalCents: request.listedTotalCents,
      finalTotalCents: request.listedTotalCents,
      createdByClerkId: admin.clerkUserId,
      notes: `Creada desde ${request.code ?? "pedido web"}. ${request.deliveryNotes ?? ""}`.trim(),
    }).returning({ id: sales.id });

    for (const requestItem of requestItems) {
      const [product] = await tx.select().from(products).where(eq(products.id, requestItem.productId)).limit(1);
      if (!product) throw new Error(`El producto ${requestItem.productNameSnapshot} ya no existe.`);
      let historicalUnitCostCents = product.commercialCostCents * (requestItem.purchaseMode === "pack10" ? 10 : 1);
      const componentSnapshots: Array<{ componentProductId: string; componentNameSnapshot: string; componentSkuSnapshot: string; physicalUnits: number; historicalUnitCostCents: number; historicalCostSubtotalCents: number }> = [];
      if (product.type === "kit") {
        const components = await tx.select({
          id: products.id, name: products.name, sku: products.sku, cost: products.commercialCostCents, quantity: kitComponents.quantity,
        }).from(kitComponents).innerJoin(products, eq(kitComponents.componentProductId, products.id))
          .where(eq(kitComponents.kitProductId, product.id));
        historicalUnitCostCents = components.reduce((sum, component) => sum + component.cost * component.quantity, 0)
          * (requestItem.purchaseMode === "pack10" ? 10 : 1);
        componentSnapshots.push(...components.map((component) => ({
          componentProductId: component.id,
          componentNameSnapshot: component.name,
          componentSkuSnapshot: component.sku,
          physicalUnits: component.quantity * requestItem.physicalUnits,
          historicalUnitCostCents: component.cost,
          historicalCostSubtotalCents: component.cost * component.quantity * requestItem.physicalUnits,
        })));
      }
      const [item] = await tx.insert(saleItems).values({
        saleId: sale.id,
        productId: product.id,
        productNameSnapshot: requestItem.productNameSnapshot,
        skuSnapshot: requestItem.skuSnapshot,
        storefrontSnapshot: requestItem.storefrontSnapshot,
        purchaseMode: requestItem.purchaseMode,
        quantity: requestItem.quantity,
        physicalUnits: requestItem.physicalUnits,
        listedUnitPriceCents: requestItem.unitPriceCents,
        finalUnitPriceCents: requestItem.unitPriceCents,
        historicalUnitCostCents,
        listedSubtotalCents: requestItem.subtotalCents,
        finalSubtotalCents: requestItem.subtotalCents,
        historicalCostSubtotalCents: historicalUnitCostCents * requestItem.quantity,
      }).returning({ id: saleItems.id });
      if (componentSnapshots.length) await tx.insert(saleItemComponents).values(componentSnapshots.map((component) => ({ ...component, saleItemId: item.id })));
    }
    const costRows = await tx.select({ cost: saleItems.historicalCostSubtotalCents }).from(saleItems).where(eq(saleItems.saleId, sale.id));
    const productCostTotalCents = costRows.reduce((sum, item) => sum + item.cost, 0);
    await tx.update(sales).set({ productCostTotalCents, profitCents: request.listedTotalCents - productCostTotalCents }).where(eq(sales.id, sale.id));
    await tx.update(purchaseRequests).set({ status: "converted", updatedAt: new Date() }).where(and(eq(purchaseRequests.id, request.id), eq(purchaseRequests.status, request.status)));
    await tx.insert(auditLogs).values({ actorClerkId: admin.clerkUserId, action: "purchase_request.converted", entityType: "purchase_request", entityId: request.id, metadata: { saleId: sale.id } });
    return sale.id;
  });
  redirect(`/admin/ventas/${saleId}` as Route);
}
