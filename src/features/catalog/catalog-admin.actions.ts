"use server";

import { del, put } from "@vercel/blob";
import { and, asc, eq, max, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getDb } from "@/db";
import {
  auditLogs, categories, kitComponents, productImages, productSpecs, products, siteSettings, stockMovements,
} from "@/db/schema";
import { requireAdmin } from "@/features/auth/require-admin";

import {
  categoryInputSchema, kitComponentInputSchema, productInputSchema, productSpecInputSchema, stockAdjustmentSchema,
  whatsappSettingsSchema,
} from "./catalog.schemas";
import { validateCatalogImage } from "./catalog-image.domain";

export type ImageUploadState = {
  success: boolean;
  error: string | null;
};

function readBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function readOptionalInteger(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  return normalized ? Number.parseInt(normalized, 10) : undefined;
}

async function authorizeMutation() {
  if (!process.env.DATABASE_URL || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
    throw new Error("Configurá Neon y Clerk antes de modificar el catálogo.");
  }
  return requireAdmin();
}

function categoryFormData(formData: FormData) {
  return categoryInputSchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    storefront: formData.get("storefront"),
    description: String(formData.get("description") ?? "").trim() || undefined,
    isActive: readBoolean(formData.get("isActive")),
  });
}

function readMoneyCents(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim().replace(",", ".");
  if (!normalized) return undefined;
  const pesos = Number(normalized);
  return Number.isFinite(pesos) ? Math.round(pesos * 100) : undefined;
}

function productFormData(formData: FormData, sku: string) {
  return productInputSchema.parse({
    categoryId: formData.get("categoryId"),
    storefront: formData.get("storefront"),
    sku,
    slug: formData.get("slug"),
    type: formData.get("type"),
    name: formData.get("name"),
    shortDescription: String(formData.get("shortDescription") ?? "").trim() || undefined,
    unitPriceCents: readMoneyCents(formData.get("unitPricePesos")),
    pack10PriceCents: readMoneyCents(formData.get("pack10PricePesos")),
    commercialCostCents: readMoneyCents(formData.get("commercialCostPesos")),
    isActive: readBoolean(formData.get("isActive")),
  });
}

async function generateUniqueSku(storefront: "housecam" | "housepet", name: string) {
  const prefix = storefront === "housepet" ? "HP" : "HC";
  const nameCode = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 5) || "ITEM";
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase();
    const candidate = `${prefix}-${nameCode}-${suffix}`;
    const [existing] = await getDb().select({ id: products.id }).from(products).where(eq(products.sku, candidate)).limit(1);
    if (!existing) return candidate;
  }
  throw new Error("No se pudo generar un SKU único. Intentá nuevamente.");
}

async function writeAudit(actorClerkId: string, action: string, entityType: string, entityId: string, before?: Record<string, unknown>, after?: Record<string, unknown>) {
  await getDb().insert(auditLogs).values({ actorClerkId, action, entityType, entityId, before, after });
}

function revalidatePublicCatalogs() {
  revalidatePath("/productos");
  revalidatePath("/housepet/productos");
  revalidatePath("/desarrollo");
  revalidatePath("/housepet");
}

export async function createCategoryAction(formData: FormData) {
  const admin = await authorizeMutation();
  const input = categoryFormData(formData);
  const [created] = await getDb().insert(categories).values(input).returning({ id: categories.id });
  await writeAudit(admin.clerkUserId, "category.created", "category", created.id, undefined, input);
  revalidatePath("/admin/categorias");
  redirect("/admin/categorias");
}

export async function updateCategoryAction(formData: FormData) {
  const admin = await authorizeMutation();
  const id = String(formData.get("id") ?? "");
  const input = categoryFormData(formData);
  const [before] = await getDb().select().from(categories).where(eq(categories.id, id)).limit(1);
  await getDb().update(categories).set({ ...input, updatedAt: new Date() }).where(eq(categories.id, id));
  await writeAudit(admin.clerkUserId, "category.updated", "category", id, before, input);
  revalidatePath("/admin/categorias");
  redirect("/admin/categorias");
}

export async function archiveCategoryAction(formData: FormData) {
  const admin = await authorizeMutation();
  const id = String(formData.get("id") ?? "");
  const [linked] = await getDb().select({ id: products.id }).from(products).where(and(eq(products.categoryId, id), sql`${products.archivedAt} is null`)).limit(1);
  if (linked) throw new Error("No se puede archivar una categoría con productos activos.");
  await getDb().update(categories).set({ archivedAt: new Date(), isActive: false, updatedAt: new Date() }).where(eq(categories.id, id));
  await writeAudit(admin.clerkUserId, "category.archived", "category", id);
  revalidatePath("/admin/categorias");
}

export async function createProductAction(formData: FormData) {
  const admin = await authorizeMutation();
  const storefront = String(formData.get("storefront"));
  const name = String(formData.get("name"));
  if (storefront !== "housecam" && storefront !== "housepet") throw new Error("Marca inválida.");
  const input = productFormData(formData, await generateUniqueSku(storefront, name));
  const [created] = await getDb().insert(products).values({
    ...input, stockOnHand: 0, createdByClerkId: admin.clerkUserId, updatedByClerkId: admin.clerkUserId,
  }).returning({ id: products.id });
  await writeAudit(admin.clerkUserId, "product.created", "product", created.id, undefined, input);
  revalidatePath("/admin/productos");
  redirect(`/admin/productos/${created.id}`);
}

export async function updateProductAction(formData: FormData) {
  const admin = await authorizeMutation();
  const id = String(formData.get("id") ?? "");
  const [before] = await getDb().select().from(products).where(eq(products.id, id)).limit(1);
  if (!before) throw new Error("Producto inexistente.");
  const input = productFormData(formData, before.sku);
  await getDb().update(products).set({ ...input, updatedAt: new Date(), updatedByClerkId: admin.clerkUserId }).where(eq(products.id, id));
  if (input.type === "standard") await getDb().delete(kitComponents).where(eq(kitComponents.kitProductId, id));
  await writeAudit(admin.clerkUserId, "product.updated", "product", id, before, input);
  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${id}`);
  redirect(`/admin/productos/${id}`);
}

export async function toggleProductPublicationAction(formData: FormData) {
  const admin = await authorizeMutation();
  const id = String(formData.get("id") ?? "");
  const nextState = readBoolean(formData.get("isActive"));
  if (nextState) {
    const [product] = await getDb().select({ type: products.type }).from(products).where(eq(products.id, id)).limit(1);
    if (product?.type === "kit") {
      const [component] = await getDb().select({ id: kitComponents.componentProductId }).from(kitComponents)
        .where(eq(kitComponents.kitProductId, id)).limit(1);
      if (!component) throw new Error("Agregá al menos un componente antes de publicar el kit.");
    }
  }
  await getDb().update(products).set({ isActive: nextState, updatedAt: new Date(), updatedByClerkId: admin.clerkUserId }).where(eq(products.id, id));
  await writeAudit(admin.clerkUserId, nextState ? "product.published" : "product.unpublished", "product", id);
  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${id}`);
}

export async function duplicateProductAction(formData: FormData) {
  const admin = await authorizeMutation();
  const id = String(formData.get("id") ?? "");
  const db = getDb();
  const [source] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!source) throw new Error("Producto inexistente.");
  const suffix = Date.now().toString().slice(-6);
  const [copy] = await db.insert(products).values({
    categoryId: source.categoryId,
    storefront: source.storefront,
    sku: `${source.sku}-COPY-${suffix}`,
    slug: `${source.slug}-copia-${suffix}`,
    type: source.type,
    name: `${source.name} (copia)`,
    shortDescription: source.shortDescription,
    description: source.description,
    unitPriceCents: source.unitPriceCents,
    pack10PriceCents: source.pack10PriceCents,
    commercialCostCents: source.commercialCostCents,
    stockOnHand: 0,
    isActive: false,
    isFeatured: false,
    createdByClerkId: admin.clerkUserId,
    updatedByClerkId: admin.clerkUserId,
  }).returning({ id: products.id });
  const specs = await db.select().from(productSpecs).where(eq(productSpecs.productId, id)).orderBy(asc(productSpecs.sortOrder));
  if (specs.length) await db.insert(productSpecs).values(specs.map((spec) => ({ productId: copy.id, label: spec.label, value: spec.value, sortOrder: spec.sortOrder })));
  const components = await db.select().from(kitComponents).where(eq(kitComponents.kitProductId, id));
  if (components.length) await db.insert(kitComponents).values(components.map((component) => ({
    kitProductId: copy.id,
    componentProductId: component.componentProductId,
    quantity: component.quantity,
  })));
  await writeAudit(admin.clerkUserId, "product.duplicated", "product", copy.id, { sourceProductId: id });
  revalidatePath("/admin/productos");
  redirect(`/admin/productos/${copy.id}`);
}

export async function archiveProductAction(formData: FormData) {
  const admin = await authorizeMutation();
  const id = String(formData.get("id") ?? "");
  await getDb().update(products).set({
    archivedAt: new Date(), isActive: false, updatedAt: new Date(), updatedByClerkId: admin.clerkUserId,
  }).where(eq(products.id, id));
  await writeAudit(admin.clerkUserId, "product.archived", "product", id);
  revalidatePath("/admin/productos");
}

export async function addProductSpecAction(formData: FormData) {
  const admin = await authorizeMutation();
  const input = productSpecInputSchema.parse({
    productId: formData.get("productId"), label: formData.get("label"), value: formData.get("value"),
  });
  const [{ value: maxOrder }] = await getDb().select({ value: max(productSpecs.sortOrder) }).from(productSpecs).where(eq(productSpecs.productId, input.productId));
  const [created] = await getDb().insert(productSpecs).values({ ...input, sortOrder: (maxOrder ?? -1) + 1 }).returning({ id: productSpecs.id });
  await writeAudit(admin.clerkUserId, "product_spec.created", "product_spec", created.id);
  revalidatePath(`/admin/productos/${input.productId}`);
  redirect(`/admin/productos/${input.productId}`);
}

export async function deleteProductSpecAction(formData: FormData) {
  const admin = await authorizeMutation();
  const id = String(formData.get("id") ?? "");
  const productId = String(formData.get("productId") ?? "");
  await getDb().delete(productSpecs).where(and(eq(productSpecs.id, id), eq(productSpecs.productId, productId)));
  await writeAudit(admin.clerkUserId, "product_spec.deleted", "product_spec", id);
  revalidatePath(`/admin/productos/${productId}`);
  redirect(`/admin/productos/${productId}`);
}

export async function upsertKitComponentAction(formData: FormData) {
  const admin = await authorizeMutation();
  const input = kitComponentInputSchema.parse({
    kitProductId: formData.get("kitProductId"),
    componentProductId: formData.get("componentProductId"),
    quantity: readOptionalInteger(formData.get("quantity")),
  });
  const db = getDb();
  const [kit] = await db.select({ type: products.type, storefront: products.storefront }).from(products)
    .where(eq(products.id, input.kitProductId)).limit(1);
  const [component] = await db.select({ type: products.type, storefront: products.storefront }).from(products)
    .where(eq(products.id, input.componentProductId)).limit(1);
  if (kit?.type !== "kit" || component?.type !== "standard" || kit.storefront !== component.storefront) {
    throw new Error("El componente debe ser un producto estándar de la misma marca.");
  }
  await db.insert(kitComponents).values(input).onConflictDoUpdate({
    target: [kitComponents.kitProductId, kitComponents.componentProductId],
    set: { quantity: input.quantity },
  });
  await writeAudit(admin.clerkUserId, "kit_component.upserted", "product", input.kitProductId, undefined, {
    componentProductId: input.componentProductId,
    quantity: input.quantity,
  });
  revalidatePath(`/admin/productos/${input.kitProductId}`);
}

export async function deleteKitComponentAction(formData: FormData) {
  const admin = await authorizeMutation();
  const kitProductId = String(formData.get("kitProductId") ?? "");
  const componentProductId = String(formData.get("componentProductId") ?? "");
  await getDb().delete(kitComponents).where(and(
    eq(kitComponents.kitProductId, kitProductId),
    eq(kitComponents.componentProductId, componentProductId),
  ));
  await writeAudit(admin.clerkUserId, "kit_component.deleted", "product", kitProductId, { componentProductId });
  revalidatePath(`/admin/productos/${kitProductId}`);
}

export async function uploadProductImageAction(_previousState: ImageUploadState, formData: FormData): Promise<ImageUploadState> {
  let productId = "";
  try {
    const admin = await authorizeMutation();
    if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("El almacenamiento de imágenes no está configurado.");
    productId = String(formData.get("productId") ?? "");
    const alt = String(formData.get("alt") ?? "").trim();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) throw new Error("Seleccioná una imagen.");
    const validImage = validateCatalogImage({ type: file.type, size: file.size, alt });

    const [{ value: maxOrder }] = await getDb().select({ value: max(productImages.sortOrder) }).from(productImages).where(eq(productImages.productId, productId));
    const isFirst = maxOrder === null;
    const blob = await put(`products/${productId}/${file.name}`, file, { access: "public", addRandomSuffix: true });
    const [created] = await getDb().insert(productImages).values({
      productId, url: blob.url, pathname: blob.pathname, alt: validImage.alt, sortOrder: (maxOrder ?? -1) + 1, isCover: isFirst,
    }).returning({ id: productImages.id });
    await writeAudit(admin.clerkUserId, "product_image.created", "product_image", created.id);
    revalidatePath(`/admin/productos/${productId}`);
    revalidatePublicCatalogs();
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const safeMessage = /imagen|JPG|PNG|WebP|almacenamiento|texto alternativo/i.test(message)
      ? message
      : "No pudimos subir la imagen. Revisá el archivo e intentá nuevamente.";
    return { success: false, error: safeMessage };
  }
  redirect(`/admin/productos/${productId}`);
}

export async function setProductCoverAction(formData: FormData) {
  const admin = await authorizeMutation();
  const id = String(formData.get("id") ?? "");
  const productId = String(formData.get("productId") ?? "");
  await getDb().transaction(async (tx) => {
    await tx.update(productImages).set({ isCover: false }).where(eq(productImages.productId, productId));
    await tx.update(productImages).set({ isCover: true }).where(and(eq(productImages.id, id), eq(productImages.productId, productId)));
  });
  await writeAudit(admin.clerkUserId, "product_image.cover_set", "product_image", id);
  revalidatePath(`/admin/productos/${productId}`);
  revalidatePublicCatalogs();
  redirect(`/admin/productos/${productId}`);
}

export async function deleteProductImageAction(formData: FormData) {
  const admin = await authorizeMutation();
  const id = String(formData.get("id") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const [image] = await getDb().select().from(productImages).where(and(eq(productImages.id, id), eq(productImages.productId, productId))).limit(1);
  if (!image) return;
  if (process.env.BLOB_READ_WRITE_TOKEN) await del(image.url);
  await getDb().delete(productImages).where(eq(productImages.id, id));
  await writeAudit(admin.clerkUserId, "product_image.deleted", "product_image", id);
  revalidatePath(`/admin/productos/${productId}`);
  revalidatePublicCatalogs();
  redirect(`/admin/productos/${productId}`);
}

export async function adjustStockAction(formData: FormData) {
  const admin = await authorizeMutation();
  const input = stockAdjustmentSchema.parse({
    productId: formData.get("productId"),
    delta: readOptionalInteger(formData.get("delta")),
    note: formData.get("note"),
  });
  const db = getDb();
  await db.transaction(async (tx) => {
    const result = await tx.execute(sql`select id, type, stock_on_hand from products where id = ${input.productId} for update`);
    const row = result.rows[0] as { id: string; type: string; stock_on_hand: number } | undefined;
    if (!row) throw new Error("Producto inexistente.");
    if (row.type !== "standard") throw new Error("El stock de kits se calcula desde sus componentes.");
    const before = Number(row.stock_on_hand);
    const after = before + input.delta;
    if (after < 0) throw new Error("El ajuste dejaría stock negativo.");
    await tx.update(products).set({ stockOnHand: after, updatedAt: new Date(), updatedByClerkId: admin.clerkUserId }).where(eq(products.id, input.productId));
    await tx.insert(stockMovements).values({
      productId: input.productId, type: "correction", delta: input.delta, stockBefore: before, stockAfter: after, note: input.note, actorClerkId: admin.clerkUserId,
    });
    await tx.insert(auditLogs).values({
      actorClerkId: admin.clerkUserId, action: "stock.adjusted", entityType: "product", entityId: input.productId,
      before: { stockOnHand: before }, after: { stockOnHand: after }, metadata: { delta: input.delta, note: input.note },
    });
  });
  revalidatePath(`/admin/productos/${input.productId}`);
  revalidatePath("/admin/productos");
  redirect(`/admin/productos/${input.productId}`);
}

export async function updateWhatsappSettingsAction(formData: FormData) {
  const admin = await authorizeMutation();
  const input = whatsappSettingsSchema.parse({ whatsappNumber: formData.get("whatsappNumber") });
  await getDb().insert(siteSettings).values({ id: "global", whatsappNumber: input.whatsappNumber })
    .onConflictDoUpdate({ target: siteSettings.id, set: { whatsappNumber: input.whatsappNumber, updatedAt: new Date() } });
  await writeAudit(admin.clerkUserId, "settings.whatsapp_updated", "site_settings", "global", undefined, input);
  revalidatePath("/admin/configuracion/whatsapp");
}
