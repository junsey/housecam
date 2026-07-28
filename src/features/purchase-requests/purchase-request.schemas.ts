import { z } from "zod";

export const purchaseRequestInputSchema = z.object({
  customer: z.object({
    fullName: z.string().trim().min(2).max(120),
    email: z.email(),
    phone: z.string().trim().min(6).max(40),
    dniCuit: z.string().trim().max(20).optional(),
  }),
  sourceStorefront: z.enum(["housecam", "housepet", "mixed"]),
  deliveryMethod: z.enum(["pickup_cordoba", "shipping_to_coordinate"]),
  deliveryNotes: z.string().trim().max(500).optional(),
  items: z.array(z.object({
    productId: z.uuid(),
    purchaseMode: z.enum(["unit", "pack10"]),
    quantity: z.int().positive().max(999),
  })).min(1).max(100),
});
