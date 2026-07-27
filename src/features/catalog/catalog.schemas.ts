import { z } from "zod";

const slugSchema = z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usá minúsculas, números y guiones.");

export const categoryInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: slugSchema,
  storefront: z.enum(["housecam", "housepet"]),
  description: z.string().trim().max(600).optional(),
  isActive: z.boolean().default(true),
});

export const productInputSchema = z.object({
  categoryId: z.uuid(),
  storefront: z.enum(["housecam", "housepet"]),
  sku: z.string().trim().min(2).max(80).transform((value) => value.toUpperCase()),
  slug: slugSchema,
  type: z.enum(["standard", "kit"]),
  name: z.string().trim().min(2).max(160),
  shortDescription: z.string().trim().max(300).optional(),
  unitPriceCents: z.int().nonnegative(),
  pack10PriceCents: z.int().nonnegative().optional(),
  commercialCostCents: z.int().nonnegative(),
  isActive: z.boolean().default(false),
});

export const productSpecInputSchema = z.object({
  productId: z.uuid(),
  label: z.string().trim().min(1).max(80),
  value: z.string().trim().min(1).max(240),
});

export const kitComponentInputSchema = z.object({
  kitProductId: z.uuid(),
  componentProductId: z.uuid(),
  quantity: z.int().positive(),
}).refine((value) => value.kitProductId !== value.componentProductId, {
  message: "Un kit no puede contenerse a sí mismo.",
});

export const stockAdjustmentSchema = z.object({
  productId: z.uuid(),
  delta: z.int().refine((value) => value !== 0, "El ajuste no puede ser cero."),
  note: z.string().trim().min(3).max(300),
});

export const whatsappSettingsSchema = z.object({
  whatsappNumber: z.string().trim().min(8).max(30).regex(/^\+?[0-9 ()-]+$/),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type ProductInput = z.infer<typeof productInputSchema>;
