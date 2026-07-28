export function physicalUnitsFor(quantity: number, mode: "unit" | "pack10"): number {
  if (!Number.isInteger(quantity) || quantity <= 0) throw new Error("La cantidad debe ser un entero positivo.");
  return quantity * (mode === "pack10" ? 10 : 1);
}

export function applyStockDelta(stockBefore: number, delta: number): number {
  if (!Number.isInteger(stockBefore) || !Number.isInteger(delta)) throw new Error("El stock se expresa en unidades enteras.");
  const stockAfter = stockBefore + delta;
  if (stockAfter < 0) throw new Error("Stock insuficiente.");
  return stockAfter;
}
