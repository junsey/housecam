import { z } from "zod";

export const createSaleSchema = z.object({
  customerLabel: z.string().trim().min(2).max(160),
  channel: z.enum(["web_request", "whatsapp", "store", "instagram", "mercado_libre", "wholesale", "other"]),
  notes: z.string().trim().max(1000).optional(),
});

export const saleItemInputSchema = z.object({
  saleId: z.uuid(),
  productId: z.uuid(),
  purchaseMode: z.enum(["unit", "pack10"]),
  quantity: z.int().positive(),
  finalUnitPriceCents: z.int().nonnegative().optional(),
});

export const saleExpenseInputSchema = z.object({
  saleId: z.uuid(),
  type: z.enum(["shipping", "payment_fee", "packaging", "outsourced_installation", "other"]),
  description: z.string().trim().max(240).optional(),
  amountCents: z.int().nonnegative(),
});

export const cancelSaleSchema = z.object({
  saleId: z.uuid(),
  reason: z.string().trim().min(3).max(500),
});

export function calculateSaleTotals(items: readonly { listedSubtotalCents: number; finalSubtotalCents: number; historicalCostSubtotalCents: number }[], expenses: readonly { amountCents: number }[]) {
  const listedTotalCents = items.reduce((sum, item) => sum + item.listedSubtotalCents, 0);
  const finalTotalCents = items.reduce((sum, item) => sum + item.finalSubtotalCents, 0);
  const productCostTotalCents = items.reduce((sum, item) => sum + item.historicalCostSubtotalCents, 0);
  const expenseTotalCents = expenses.reduce((sum, expense) => sum + expense.amountCents, 0);
  return {
    listedTotalCents,
    finalTotalCents,
    discountTotalCents: Math.max(0, listedTotalCents - finalTotalCents),
    productCostTotalCents,
    expenseTotalCents,
    profitCents: finalTotalCents - productCostTotalCents - expenseTotalCents,
  };
}
