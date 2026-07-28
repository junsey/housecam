import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";

import { convertPurchaseRequestToSaleAction, updatePurchaseRequestStatusAction } from "@/features/requests/requests-admin.actions";
import { getPurchaseRequest } from "@/features/requests/requests-admin.data";

const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

export default async function PurchaseRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getPurchaseRequest(id);
  if (!data) notFound();
  const { request, items } = data;
  const editable = request.status === "new" || request.status === "contacted";
  return <main className="shell">
    <Link className="text-sm font-bold text-[var(--brand)]" href={"/admin/pedidos" as Route}>← Pedidos</Link>
    <div className="mt-6 flex flex-wrap items-start justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">{request.status}</p><h1 className="mt-2 text-4xl font-bold">{request.code}</h1><p className="mt-2 text-[var(--muted)]">{request.customerName} · {request.customerPhone}</p></div>
      {editable && <div className="flex flex-wrap gap-3"><form action={updatePurchaseRequestStatusAction}><input name="id" type="hidden" value={id} /><input name="status" type="hidden" value="contacted" /><button className="rounded-xl border border-[var(--border)] px-4 py-3 font-bold">Marcar contactado</button></form><form action={convertPurchaseRequestToSaleAction}><input name="id" type="hidden" value={id} /><button className="rounded-xl bg-[var(--brand)] px-5 py-3 font-bold text-white">Convertir en venta</button></form></div>}
    </div>
    <section className="mt-8 grid gap-5 md:grid-cols-2"><article className="card p-6"><h2 className="text-xl font-bold">Cliente y entrega</h2><dl className="mt-5 grid gap-3 text-sm"><div><dt className="text-[var(--muted)]">Correo</dt><dd>{request.customerEmail}</dd></div><div><dt className="text-[var(--muted)]">Teléfono</dt><dd>{request.customerPhone}</dd></div><div><dt className="text-[var(--muted)]">Entrega</dt><dd>{request.deliveryMethod === "pickup_cordoba" ? "Retiro en Córdoba" : "Envío a coordinar"}</dd></div>{request.deliveryNotes && <div><dt className="text-[var(--muted)]">Notas</dt><dd>{request.deliveryNotes}</dd></div>}</dl></article>
      <article className="card p-6"><h2 className="text-xl font-bold">Resumen</h2><strong className="mt-5 block text-3xl">{money.format(request.listedTotalCents / 100)}</strong><p className="mt-2 text-sm text-[var(--muted)]">{items.length} productos · recibido {request.createdAt.toLocaleString("es-AR")}</p></article></section>
    <section className="card mt-6 p-6"><h2 className="text-xl font-bold">Productos</h2><div className="mt-4 divide-y divide-[var(--border)]">{items.map((item) => <div className="flex justify-between gap-5 py-4" key={item.id}><div><strong>{item.productNameSnapshot}</strong><p className="text-sm text-[var(--muted)]">{item.quantity} × {item.purchaseMode === "pack10" ? "pack de 10" : "unidad"} · {item.skuSnapshot}</p></div><strong>{money.format(item.subtotalCents / 100)}</strong></div>)}</div></section>
    {editable && <form action={updatePurchaseRequestStatusAction} className="mt-6"><input name="id" type="hidden" value={id} /><input name="status" type="hidden" value="discarded" /><button className="text-sm font-bold text-red-600">Descartar pedido</button></form>}
  </main>;
}
