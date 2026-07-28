export type SaleTotalsInput = {
  listedSubtotalCents: number;
  finalSubtotalCents: number;
  productCostCents: number;
  expenseCents: number;
};

export function calculateSaleTotals(lines: readonly SaleTotalsInput[]) {
  const totals = lines.reduce((result, line) => ({
    listedTotalCents: result.listedTotalCents + line.listedSubtotalCents,
    finalTotalCents: result.finalTotalCents + line.finalSubtotalCents,
    productCostTotalCents: result.productCostTotalCents + line.productCostCents,
    expenseTotalCents: result.expenseTotalCents + line.expenseCents,
  }), { listedTotalCents: 0, finalTotalCents: 0, productCostTotalCents: 0, expenseTotalCents: 0 });

  return {
    ...totals,
    discountTotalCents: totals.listedTotalCents - totals.finalTotalCents,
    profitCents: totals.finalTotalCents - totals.productCostTotalCents - totals.expenseTotalCents,
  };
}

export function statusAfterCancellingConfirmedSale(hasPurchaseRequest: boolean) {
  return hasPurchaseRequest ? "contacted" as const : null;
}
