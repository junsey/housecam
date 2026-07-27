"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getDb } from "@/db";
import { categories, products } from "@/db/schema";
import { requireAdmin } from "@/features/auth/require-admin";

import { categoryInputSchema, productInputSchema } from "./catalog.schemas";

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

export async function createCategoryAction(formData: FormData) {
  await authorizeMutation();
  const input = categoryInputSchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    storefront: formData.get("storefront"),
    description: String(formData.get("description") ?? "").trim() || undefined,
    isActive: readBoolean(formData.get("isActive")),
  });

  await getDb().insert(categories).values(input);
  revalidatePath("/admin/categorias");
  redirect("/admin/categorias");
}

export async function archiveCategoryAction(formData: FormData) {
  await authorizeMutation();
  const id = String(formData.get("id") ?? "");
  await getDb().update(categories).set({ archivedAt: new Date(), isActive: false, updatedAt: new Date() })
    .where(eq(categories.id, id));
  revalidatePath("/admin/categorias");
}

export async function createProductAction(formData: FormData) {
  const admin = await authorizeMutation();
  const input = productInputSchema.parse({
    categoryId: formData.get("categoryId"),
    storefront: formData.get("storefront"),
    sku: formData.get("sku"),
    slug: formData.get("slug"),
    type: formData.get("type"),
    name: formData.get("name"),
    shortDescription: String(formData.get("shortDescription") ?? "").trim() || undefined,
    unitPriceCents: readOptionalInteger(formData.get("unitPriceCents")),
    pack10PriceCents: readOptionalInteger(formData.get("pack10PriceCents")),
    commercialCostCents: readOptionalInteger(formData.get("commercialCostCents")),
    isActive: readBoolean(formData.get("isActive")),
  });

  await getDb().insert(products).values({
    ...input,
    stockOnHand: 0,
    createdByClerkId: admin.clerkUserId,
    updatedByClerkId: admin.clerkUserId,
  });
  revalidatePath("/admin/productos");
  redirect("/admin/productos");
}

export async function archiveProductAction(formData: FormData) {
  const admin = await authorizeMutation();
  const id = String(formData.get("id") ?? "");
  await getDb().update(products).set({
    archivedAt: new Date(),
    isActive: false,
    updatedAt: new Date(),
    updatedByClerkId: admin.clerkUserId,
  }).where(eq(products.id, id));
  revalidatePath("/admin/productos");
}
