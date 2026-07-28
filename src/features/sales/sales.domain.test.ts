import { describe, expect, it } from "vitest";

import { calculateSaleTotals, saleItemInputSchema } from "./sales.schemas";

describe("dominio de ventas", () => {
  it("calcula descuentos, costos, gastos y margen", () => {
    expect(calculateSaleTotals([
      { listedSubtotalCents: 10_000, finalSubtotalCents: 9_000, historicalCostSubtotalCents: 5_000 },
      { listedSubtotalCents: 4_000, finalSubtotalCents: 4_000, historicalCostSubtotalCents: 2_000 },
    ], [{ amountCents: 500 }])).toEqual({
      listedTotalCents: 14_000,
      finalTotalCents: 13_000,
      discountTotalCents: 1_000,
      productCostTotalCents: 7_000,
      expenseTotalCents: 500,
      profitCents: 5_500,
    });
  });

  it("rechaza cantidades no positivas", () => {
    expect(() => saleItemInputSchema.parse({
      saleId: "11111111-1111-4111-8111-111111111111",
      productId: "22222222-2222-4222-8222-222222222222",
      purchaseMode: "unit",
      quantity: 0,
    })).toThrow();
  });
});
