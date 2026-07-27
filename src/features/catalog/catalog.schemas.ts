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

export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type ProductInput = z.infer<typeof productInputSchema>;
