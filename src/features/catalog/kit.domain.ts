export type KitComponent = {
  productId: string;
  quantityPerKit: number;
  stockOnHand: number;
  commercialUnitCostCents: number;
};

export function getKitAvailability(components: readonly KitComponent[]): number {
  if (components.length === 0) return 0;
  return Math.min(...components.map(({ quantityPerKit, stockOnHand }) => {
    if (!Number.isInteger(quantityPerKit) || quantityPerKit <= 0) throw new Error("La cantidad por kit debe ser positiva.");
    if (!Number.isInteger(stockOnHand) || stockOnHand < 0) throw new Error("El stock físico no puede ser negativo.");
    return Math.floor(stockOnHand / quantityPerKit);
  }));
}

export function getKitMaterialCostCents(components: readonly KitComponent[]): number {
  return components.reduce((total, component) => {
    if (!Number.isInteger(component.commercialUnitCostCents) || component.commercialUnitCostCents < 0) {
      throw new Error("El costo unitario debe ser un entero no negativo.");
    }
    return total + component.quantityPerKit * component.commercialUnitCostCents;
  }, 0);
}
