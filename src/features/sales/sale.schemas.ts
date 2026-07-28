import { z } from "zod";

export const saleDraftInputSchema = z.object({
  purchaseRequestId: z.uuid().optional(),
  channel: z.enum(["web_request", "whatsapp", "store", "instagram", "mercado_libre", "wholesale", "other"]),
  customerLabel: z.string().trim().max(160).optional(),
  notes: z.string().trim().max(2000).optional(),
  items: z.array(z.object({
    productId: z.uuid(),
    purchaseMode: z.enum(["unit", "pack10"]),
    quantity: z.int().positive(),
    finalUnitPriceCents: z.int().nonnegative(),
  })).min(1),
});
