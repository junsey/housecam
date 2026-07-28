"use server";

import { and, eq, inArray, isNull } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import { getDb } from "@/db";
import {
  categories, kitComponents, products, purchaseRequestItems, purchaseRequests, siteSettings,
} from "@/db/schema";
import { getWhatsappHref } from "@/lib/whatsapp";

type PublicCartItem = {
  productId: string;
  purchaseMode: "unit" | "pack10";
  quantity: number;
};

export type PurchaseRequestState = {
  ok: boolean;
  error?: string;
  code?: string;
  whatsappHref?: string;
};

export async function createPurchaseRequestAction(
  _previousState: PurchaseRequestState,
  formData: FormData,
): Promise<PurchaseRequestState> {
  if (!process.env.DATABASE_URL) return { ok: false, error: "La tienda todavía no está conectada para recibir pedidos." };

  const customerName = String(formData.get("customerName") ?? "").trim();
  const customerEmail = String(formData.get("customerEmail") ?? "").trim().toLowerCase();
  const customerPhone = String(formData.get("customerPhone") ?? "").trim();
  const deliveryMethod = String(formData.get("deliveryMethod") ?? "");
  const deliveryNotes = String(formData.get("deliveryNotes") ?? "").trim();
  let requestedItems: PublicCartItem[];

  try {
    requestedItems = JSON.parse(String(formData.get("items") ?? "[]")) as PublicCartItem[];
  } catch {
    return { ok: false, error: "No pudimos interpretar los productos del carrito." };
  }

  if (customerName.length < 2) return { ok: false, error: "Ingresá tu nombre para continuar." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) return { ok: false, error: "Ingresá un correo electrónico válido." };
  if (customerPhone.replace(/\D/g, "").length < 8) return { ok: false, error: "Ingresá un teléfono válido con código de área." };
  if (deliveryMethod !== "pickup_cordoba" && deliveryMethod !== "shipping_to_coordinate") {
    return { ok: false, error: "Seleccioná cómo querés recibir el pedido." };
  }
  if (!requestedItems.length || requestedItems.length > 50) return { ok: false, error: "El carrito está vacío o contiene demasiados productos." };
  if (requestedItems.some((item) => !item.productId || !["unit", "pack10"].includes(item.purchaseMode) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 999)) {
    return { ok: false, error: "Una de las cantidades del carrito no es válida." };
  }

  const ids = [...new Set(requestedItems.map((item) => item.productId))];
  const db = getDb();

  try {
    const result = await db.transaction(async (tx) => {
      const productRows = await tx.select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        type: products.type,
        storefront: products.storefront,
        unitPriceCents: products.unitPriceCents,
        pack10PriceCents: products.pack10PriceCents,
        stockOnHand: products.stockOnHand,
      }).from(products)
        .innerJoin(categories, eq(products.categoryId, categories.id))
        .where(and(
          inArray(products.id, ids),
          eq(products.isActive, true),
          eq(categories.isActive, true),
          isNull(products.archivedAt),
          isNull(categories.archivedAt),
        ));

      if (productRows.length !== ids.length) throw new Error("Uno de los productos ya no está disponible.");
      const byId = new Map(productRows.map((product) => [product.id, product]));
      const kitIds = productRows.filter((product) => product.type === "kit").map((product) => product.id);
      const componentRows = kitIds.length ? await tx.select({
        kitProductId: kitComponents.kitProductId,
        quantity: kitComponents.quantity,
        stockOnHand: products.stockOnHand,
      }).from(kitComponents)
        .innerJoin(products, eq(kitComponents.componentProductId, products.id))
        .where(inArray(kitComponents.kitProductId, kitIds)) : [];

      const snapshots = requestedItems.map((requested) => {
        const product = byId.get(requested.productId)!;
        const physicalUnits = requested.quantity * (requested.purchaseMode === "pack10" ? 10 : 1);
        const price = requested.purchaseMode === "pack10" ? product.pack10PriceCents : product.unitPriceCents;
        if (price === null) throw new Error(`${product.name} no está disponible en pack de 10.`);
        const available = product.type === "kit"
          ? Math.min(...componentRows.filter((row) => row.kitProductId === product.id).map((row) => Math.floor(row.stockOnHand / row.quantity)))
          : product.stockOnHand;
        if (!Number.isFinite(available) || available < physicalUnits) {
          throw new Error(`No hay suficientes unidades de ${product.name}. Podés consultarnos por disponibilidad.`);
        }
        return {
          product,
          purchaseMode: requested.purchaseMode,
          quantity: requested.quantity,
          physicalUnits,
          unitPriceCents: price,
          subtotalCents: price * requested.quantity,
        };
      });

      const listedTotalCents = snapshots.reduce((sum, item) => sum + item.subtotalCents, 0);
      const storefronts = new Set(snapshots.map((item) => item.product.storefront));
      const sourceStorefront = storefronts.size > 1 ? "mixed" : snapshots[0].product.storefront;
      const [settings] = await tx.select({ whatsappNumber: siteSettings.whatsappNumber }).from(siteSettings).where(eq(siteSettings.id, "global")).limit(1);
      const whatsappNumber = settings?.whatsappNumber ?? "";

      const [request] = await tx.insert(purchaseRequests).values({
        publicToken: randomUUID(),
        customerSnapshot: { name: customerName, email: customerEmail, phone: customerPhone },
        customerName,
        customerEmail,
        customerPhone,
        sourceStorefront,
        deliveryMethod,
        deliveryNotes: deliveryNotes || null,
        listedTotalCents,
        whatsappNumberSnapshot: whatsappNumber,
        whatsappMessageSnapshot: "",
      }).returning({ id: purchaseRequests.id, requestNumber: purchaseRequests.requestNumber });

      const code = `PED-${String(request.requestNumber).padStart(6, "0")}`;
      const message = `Hola, realicé el pedido ${code}:\n${snapshots.map((item) =>
        `• ${item.quantity} ${item.purchaseMode === "pack10" ? "pack(s) de 10" : "unidad(es)"} de ${item.product.name}`).join("\n")}\nTotal estimado: ${new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(listedTotalCents / 100)}.\nNombre: ${customerName}.`;

      await tx.insert(purchaseRequestItems).values(snapshots.map((item) => ({
        purchaseRequestId: request.id,
        productId: item.product.id,
        productNameSnapshot: item.product.name,
        skuSnapshot: item.product.sku,
        storefrontSnapshot: item.product.storefront,
        purchaseMode: item.purchaseMode,
        quantity: item.quantity,
        physicalUnits: item.physicalUnits,
        unitPriceCents: item.unitPriceCents,
        subtotalCents: item.subtotalCents,
      })));
      await tx.update(purchaseRequests).set({ code, whatsappMessageSnapshot: message }).where(eq(purchaseRequests.id, request.id));

      return { code, whatsappHref: getWhatsappHref(whatsappNumber, message) ?? undefined };
    });

    return { ok: true, ...result };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "No pudimos registrar el pedido." };
  }
}
