import type { Metadata } from "next";
import Link from "next/link";

import { createSaleAction } from "@/features/sales/sales-admin.actions";
import { getSaleProductOptions } from "@/features/sales/sales-admin.data";

export const metadata: Metadata = { title: "Nueva venta" };
const field = "min-h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3";

export default async function NewSalePage() {
  const products = await getSaleProductOptions();
  return <main className="shell py-10"><p className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">Ventas</p><h1 className="mt-2 text-3xl font-bold">Nueva venta</h1>
    <p className="mt-2 text-[var(--muted)]">La venta se creará recién cuando completes estos datos.</p>
    <form action={createSaleAction} className="card mt-8 grid gap-5 p-6 md:grid-cols-2">
      <label className="grid gap-2 text-sm font-bold">Cliente<input className={field} name="customerLabel" required /></label>
      <label className="grid gap-2 text-sm font-bold">Canal<select className={field} name="channel"><option value="whatsapp">WhatsApp</option><option value="store">Local</option><option value="instagram">Instagram</option><option value="mercado_libre">Mercado Libre</option><option value="wholesale">Mayorista</option><option value="other">Otro</option></select></label>
      <div className="border-t border-[var(--border)] pt-5 md:col-span-2">
        <h2 className="text-xl font-bold">Primer producto</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Luego podrás agregar más productos y gastos antes de confirmarla.</p>
      </div>
      <label className="grid gap-2 text-sm font-bold">Producto<select className={field} name="productId" required defaultValue=""><option disabled value="">Seleccionar producto</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.sku}</option>)}</select></label>
      <label className="grid gap-2 text-sm font-bold">Modalidad<select className={field} name="purchaseMode"><option value="unit">Unidad</option><option value="pack10">Pack de 10</option></select></label>
      <label className="grid gap-2 text-sm font-bold">Cantidad<input className={field} min="1" name="quantity" required type="number" defaultValue="1" /></label>
      <label className="grid gap-2 text-sm font-bold">Precio final unitario (ARS, opcional)<input className={field} min="0" name="finalUnitPricePesos" step="0.01" type="number" /></label>
      <label className="grid gap-2 text-sm font-bold md:col-span-2">Notas<textarea className="min-h-28 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3" name="notes" /></label>
      <div className="flex flex-wrap justify-end gap-3 md:col-span-2"><Link className="rounded-xl border border-[var(--border)] px-6 py-3 font-bold" href="/admin/ventas">Cancelar</Link><button className="rounded-xl bg-[var(--brand)] px-6 py-3 font-bold text-white" disabled={!products.length}>Crear venta</button></div>
    </form>
  </main>;
}
