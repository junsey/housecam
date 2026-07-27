import { describe, expect, it } from "vitest";

import { assertCanManageAdminRoles } from "./auth/roles.domain";
import { getKitAvailability, getKitMaterialCostCents } from "./catalog/kit.domain";
import { applyStockDelta, physicalUnitsFor } from "./inventory/inventory.domain";
import { calculateSaleTotals, statusAfterCancellingConfirmedSale } from "./sales/sale.domain";

describe("fundamentos del dominio", () => {
  it("calcula disponibilidad y costo real de un kit desde sus componentes", () => {
    const components = [
      { productId: "camera", quantityPerKit: 2, stockOnHand: 7, commercialUnitCostCents: 12_000 },
      { productId: "dvr", quantityPerKit: 1, stockOnHand: 5, commercialUnitCostCents: 20_000 },
    ];
    expect(getKitAvailability(components)).toBe(3);
    expect(getKitMaterialCostCents(components)).toBe(44_000);
  });

  it("convierte packs a unidades físicas e impide stock negativo", () => {
    expect(physicalUnitsFor(3, "pack10")).toBe(30);
    expect(applyStockDelta(30, -30)).toBe(0);
    expect(() => applyStockDelta(2, -3)).toThrow("Stock insuficiente");
  });

  it("congela la aritmética financiera en centavos", () => {
    expect(calculateSaleTotals([{
      listedSubtotalCents: 100_000,
      finalSubtotalCents: 95_000,
      productCostCents: 55_000,
      expenseCents: 5_000,
    }])).toEqual({
      listedTotalCents: 100_000,
      finalTotalCents: 95_000,
      productCostTotalCents: 55_000,
      expenseTotalCents: 5_000,
      discountTotalCents: 5_000,
      profitCents: 35_000,
    });
  });

  it("devuelve una solicitud a contactada al anular su venta", () => {
    expect(statusAfterCancellingConfirmedSale(true)).toBe("contacted");
  });

  it("reserva la gestión de administradores al admin inicial", () => {
    expect(() => assertCanManageAdminRoles({ role: "admin", clerkUserId: "secondary" }, "initial")).toThrow();
    expect(() => assertCanManageAdminRoles({ role: "admin", clerkUserId: "initial" }, "initial")).not.toThrow();
  });
});
