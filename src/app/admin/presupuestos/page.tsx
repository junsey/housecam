import type { Metadata, Route } from "next";
import Link from "next/link";

import { getQuotes } from "@/features/quotes/quotes-admin.data";

export const metadata: Metadata = { title: "Presupuestos" };
const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 });
const statusLabel = { draft: "Borrador", sent: "Enviado", converted: "Convertido", cancelled: "Cancelado" } as const;

export default async function QuotesPage({ searchParams }: { searchParams: Promise<{ eliminado?: string; error?: string }> }) {
  const query = await searchParams;
  const items = await getQuotes();
  return <main className="shell py-10">
    <Link className="admin-back-link" href="/admin/ventas">← Ventas</Link>
    <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">Ventas</p><h1 className="mt-2 text-4xl font-bold">Presupuestos</h1><p className="mt-3 text-[var(--muted)]">Propuestas descargables que luego podés convertir en una venta.</p></div>
      <Link className="admin-primary-button" href={"/admin/presupuestos/nuevo" as Route}>Nuevo presupuesto</Link>
    </div>
    {query.eliminado === "1" && <p className="admin-alert admin-alert-success mt-6">El presupuesto se eliminó correctamente.</p>}
    {query.error === "missing" && <p className="admin-alert admin-alert-error mt-6">El presupuesto ya no existe.</p>}
    <div className="card mt-8 overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-[var(--border)] text-[var(--muted)]"><tr><th className="p-4">Presupuesto</th><th>Cliente</th><th>Estado</th><th>Total</th><th>Fecha</th></tr></thead>
        <tbody>{items.map((item) => <tr className="border-b border-[var(--border)] last:border-0" key={item.id}><td className="p-4 font-bold"><Link className="text-[var(--brand)]" href={`/admin/presupuestos/${item.id}` as Route}>{item.code ?? `#${item.quoteNumber}`}</Link></td><td>{item.customerName}</td><td>{statusLabel[item.status as keyof typeof statusLabel] ?? item.status}</td><td>{money.format(item.totalCents / 100)}</td><td>{item.createdAt.toLocaleDateString("es-AR")}</td></tr>)}</tbody>
      </table>
      {!items.length && <p className="p-6 text-sm text-[var(--muted)]">Todavía no hay presupuestos.</p>}
    </div>
  </main>;
}
