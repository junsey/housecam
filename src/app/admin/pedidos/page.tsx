import type { Route } from "next";
import Link from "next/link";

import { getPurchaseRequests } from "@/features/requests/requests-admin.data";

const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
const labels = { new: "Nuevo", contacted: "Contactado", converted: "Convertido", discarded: "Descartado" } as const;

export default async function PurchaseRequestsPage() {
  const data = await getPurchaseRequests();
  return <main className="shell">
    <Link className="mb-6 inline-flex text-sm font-bold text-[var(--brand)] hover:underline" href={"/admin/ventas" as Route}>← Volver a Ventas</Link>
    <div><p className="eyebrow">Operación</p><h1 className="mt-3 text-4xl font-bold">Pedidos</h1><p className="mt-3 text-[var(--muted)]">Solicitudes realizadas desde las tiendas HouseCam y HousePet.</p></div>
    {!data.configured ? <p className="card mt-8 p-6">Conectá la base para recibir pedidos.</p> : <section className="card mt-8 overflow-x-auto p-6">
      <table className="w-full min-w-[800px] text-left text-sm"><thead className="border-b border-[var(--border)] text-xs uppercase tracking-wider text-[var(--muted)]"><tr><th className="p-4">Pedido</th><th>Cliente</th><th>Origen</th><th>Estado</th><th>Total</th><th>Fecha</th></tr></thead>
        <tbody className="divide-y divide-[var(--border)]">{data.requests.map((request) => <tr key={request.id}><td className="p-4 font-bold"><Link className="text-[var(--brand)]" href={`/admin/pedidos/${request.id}` as Route}>{request.code ?? `#${request.requestNumber}`}</Link></td><td>{request.customerName}<small className="block text-[var(--muted)]">{request.customerPhone}</small></td><td>{request.sourceStorefront}</td><td>{labels[request.status]}</td><td>{money.format(request.listedTotalCents / 100)}</td><td>{request.createdAt.toLocaleDateString("es-AR")}</td></tr>)}</tbody>
      </table>
      {!data.requests.length && <p className="p-6 text-sm text-[var(--muted)]">Todavía no se recibieron pedidos.</p>}
    </section>}
  </main>;
}
