import type { Metadata } from "next";

import { createSaleAction } from "@/features/sales/sales-admin.actions";

export const metadata: Metadata = { title: "Nueva venta" };
const field = "min-h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3";

export default function NewSalePage() {
  return <main className="shell py-10"><p className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">Ventas</p><h1 className="mt-2 text-3xl font-bold">Nuevo borrador</h1>
    <form action={createSaleAction} className="card mt-8 grid gap-5 p-6 md:grid-cols-2">
      <label className="grid gap-2 text-sm font-bold">Cliente<input className={field} name="customerLabel" required /></label>
      <label className="grid gap-2 text-sm font-bold">Canal<select className={field} name="channel"><option value="whatsapp">WhatsApp</option><option value="store">Local</option><option value="instagram">Instagram</option><option value="mercado_libre">Mercado Libre</option><option value="wholesale">Mayorista</option><option value="other">Otro</option></select></label>
      <label className="grid gap-2 text-sm font-bold md:col-span-2">Notas<textarea className="min-h-28 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3" name="notes" /></label>
      <div className="flex justify-end md:col-span-2"><button className="rounded-xl bg-[var(--brand)] px-6 py-3 font-bold text-white">Crear borrador</button></div>
    </form>
  </main>;
}
