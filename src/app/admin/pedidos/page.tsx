import type { Metadata, Route } from "next";
import Link from "next/link";

import { getPurchaseRequests } from "@/features/requests/requests-admin.data";

export const metadata: Metadata = { title: "Pedidos" };

const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
const labels = { new: "Nuevo", contacted: "Contactado", converted: "Convertido", discarded: "Descartado" } as const;
const brandLabels = { housecam: "HouseCam", housepet: "HousePet", mixed: "Mixto" } as const;

export default async function PurchaseRequestsPage() {
  const data = await getPurchaseRequests();
  const activeRequests = data.requests.filter((request) => request.status === "new" || request.status === "contacted");
  const totalRequested = data.requests
    .filter((request) => request.status !== "discarded")
    .reduce((total, request) => total + request.listedTotalCents, 0);

  return <main className="shell py-10">
    <Link className="admin-back-link" href={"/admin/ventas" as Route}>← Volver a Ventas</Link>

    <header className="admin-requests-header">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">Operación</p>
        <h1>Pedidos</h1>
        <p>Solicitudes realizadas desde las tiendas HouseCam y HousePet.</p>
      </div>
      <Link className="admin-secondary-button" href={"/admin/ventas" as Route}>Ir a ventas</Link>
    </header>

    {!data.configured ? <p className="card mt-8 p-6">Conectá la base para recibir pedidos.</p> : <>
      <section className="admin-request-metrics" aria-label="Resumen de pedidos">
        <RequestMetric label="Pedidos recibidos" value={String(data.requests.length)} />
        <RequestMetric label="Pendientes de gestión" value={String(activeRequests.length)} highlighted={activeRequests.length > 0} />
        <RequestMetric label="Convertidos" value={String(data.requests.filter((request) => request.status === "converted").length)} />
        <RequestMetric label="Valor solicitado" value={money.format(totalRequested / 100)} />
      </section>

      <section className="card admin-requests-table">
        <div className="admin-requests-table-heading">
          <div><h2>Listado de pedidos</h2><p>Seleccioná un pedido para revisar sus datos y continuar la gestión.</p></div>
          <span>{data.requests.length} {data.requests.length === 1 ? "registro" : "registros"}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead><tr><th>Pedido</th><th>Cliente</th><th>Origen</th><th>Estado</th><th>Total</th><th>Fecha</th><th><span className="sr-only">Acción</span></th></tr></thead>
            <tbody>{data.requests.map((request) => <tr key={request.id}>
              <td><Link className="admin-request-code" href={`/admin/pedidos/${request.id}` as Route}>{request.code ?? `#${request.requestNumber}`}</Link></td>
              <td><strong>{request.customerName}</strong><small>{request.customerPhone}</small></td>
              <td><span className={`admin-brand-pill is-${request.sourceStorefront}`}>{brandLabels[request.sourceStorefront]}</span></td>
              <td><span className={`admin-request-status is-${request.status}`}>{labels[request.status]}</span></td>
              <td className="font-bold">{money.format(request.listedTotalCents / 100)}</td>
              <td><span>{request.createdAt.toLocaleDateString("es-AR")}</span><small>{request.createdAt.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}</small></td>
              <td className="text-right"><Link className="admin-request-open" href={`/admin/pedidos/${request.id}` as Route} aria-label={`Ver pedido ${request.code ?? request.requestNumber}`}>Ver detalle <span aria-hidden="true">→</span></Link></td>
            </tr>)}</tbody>
          </table>
        </div>
        {!data.requests.length && <div className="admin-requests-empty"><strong>Todavía no se recibieron pedidos</strong><p>Cuando un cliente complete una solicitud desde la tienda aparecerá en este listado.</p></div>}
      </section>
    </>}
  </main>;
}

function RequestMetric({ label, value, highlighted = false }: { label: string; value: string; highlighted?: boolean }) {
  return <article className={`card admin-request-metric ${highlighted ? "is-highlighted" : ""}`}><p>{label}</p><strong>{value}</strong></article>;
}
