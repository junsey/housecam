import type { Metadata, Route } from "next";
import Link from "next/link";

import { getSalesDashboard } from "@/features/sales/sales-admin.data";

export const metadata: Metadata = { title: "Ventas" };
const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0, maximumFractionDigits: 2 });

export default async function SalesPage() {
  const data = await getSalesDashboard();
  return (
    <main className="shell py-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div><p className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">Configuración</p><h1 className="mt-2 text-3xl font-bold">Ventas e inventario</h1><p className="mt-3 text-[var(--muted)]">Borradores, confirmación transaccional, gastos y margen real.</p></div>
        <div className="flex gap-2"><Link className="rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-bold" href="/admin/ventas/exportar">Exportar CSV</Link><Link className="rounded-xl bg-[var(--brand)] px-5 py-3 font-bold text-white" href="/admin/ventas/nueva">Nueva venta</Link></div>
      </div>
      {!data.configured ? <p className="card mt-8 p-6 text-[var(--muted)]">Configurá Neon y Clerk para operar ventas reales.</p> : (
        <>
          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Ventas confirmadas" value={String(data.metrics?.confirmedCount ?? 0)} />
            <Metric label="Facturación" value={money.format((data.metrics?.revenueCents ?? 0) / 100)} />
            <Metric label="Margen" value={money.format((data.metrics?.profitCents ?? 0) / 100)} />
            <Metric label="Borradores" value={String(data.metrics?.draftCount ?? 0)} />
          </section>
          <div className="card mt-8 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-[var(--border)] text-[var(--muted)]"><tr><th className="p-4">Venta</th><th>Cliente</th><th>Canal</th><th>Estado</th><th>Total</th><th>Margen</th><th>Fecha</th></tr></thead>
              <tbody>{data.sales.map((sale) => <tr className="border-b border-[var(--border)] last:border-0" key={sale.id}><td className="p-4 font-bold"><Link className="text-[var(--brand)]" href={`/admin/ventas/${sale.id}` as Route}>{sale.code ?? `#${sale.saleNumber}`}</Link></td><td>{sale.customerLabel}</td><td>{sale.channel}</td><td>{sale.status}</td><td>{money.format(sale.finalTotalCents / 100)}</td><td>{money.format(sale.profitCents / 100)}</td><td>{sale.createdAt.toLocaleDateString("es-AR")}</td></tr>)}</tbody>
            </table>
            {!data.sales.length && <p className="p-6 text-sm text-[var(--muted)]">Todavía no hay ventas.</p>}
          </div>
        </>
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <article className="card p-5"><p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">{label}</p><p className="mt-3 text-2xl font-bold">{value}</p></article>;
}
