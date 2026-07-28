import type { Metadata } from "next";
import { CreateSaleForm } from "@/components/create-sale-form";
import { getSaleProductOptions } from "@/features/sales/sales-admin.data";

export const metadata: Metadata = { title: "Nueva venta" };
export default async function NewSalePage() {
  const products = await getSaleProductOptions();
  return <main className="shell py-10"><p className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">Ventas</p><h1 className="mt-2 text-3xl font-bold">Nueva venta</h1>
    <p className="mt-2 text-[var(--muted)]">La venta se creará recién cuando completes estos datos.</p>
    <CreateSaleForm products={products} />
  </main>;
}
