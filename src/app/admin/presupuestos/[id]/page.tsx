import type { Metadata, Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { convertQuoteToSaleAction, deleteQuoteAction } from "@/features/quotes/quotes-admin.actions";
import { getQuote } from "@/features/quotes/quotes-admin.data";

export const metadata: Metadata = { title: "Detalle del presupuesto" };
const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0, maximumFractionDigits: 2 });

export default async function QuoteDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const data = await getQuote(id);
  if (!data) notFound();
  return <main className="shell py-10">
    <Link className="admin-back-link" href={"/admin/presupuestos" as Route}>← Presupuestos</Link>
    <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">{data.quote.status}</p><h1 className="mt-2 text-4xl font-bold">{data.quote.code}</h1><p className="mt-2 text-[var(--muted)]">{data.quote.customerName}</p></div>
      <div className="flex flex-wrap gap-2">
        <a className="admin-secondary-button" href={`/admin/presupuestos/${id}/pdf`}>Descargar PDF</a>
        <a className="admin-secondary-button" href={`/admin/presupuestos/${id}/jpg`}>Descargar JPG</a>
        {data.quote.status !== "converted" && data.quote.status !== "cancelled" && <form action={convertQuoteToSaleAction}><input type="hidden" name="quoteId" value={id} /><button className="admin-primary-button">Convertir en venta</button></form>}
        {data.quote.convertedSaleId && <Link className="admin-primary-button" href={`/admin/ventas/${data.quote.convertedSaleId}` as Route}>Ver venta</Link>}
        {data.quote.status !== "converted" && !data.quote.convertedSaleId && <form action={deleteQuoteAction}><input type="hidden" name="quoteId" value={id} /><ConfirmSubmitButton className="admin-danger-button" message={`¿Eliminar ${data.quote.code ?? "este presupuesto"}? Esta acción no se puede deshacer.`}>Eliminar presupuesto</ConfirmSubmitButton></form>}
      </div>
    </div>
    {query.error === "converted" && <p className="admin-alert admin-alert-error mt-6">Este presupuesto ya fue convertido en una venta y debe conservarse como registro.</p>}
    <section className="card mt-8 p-6">
      <div className="grid gap-2 text-sm sm:grid-cols-3"><p><strong>Teléfono:</strong> {data.quote.customerPhone || "Sin informar"}</p><p><strong>Email:</strong> {data.quote.customerEmail || "Sin informar"}</p><p><strong>Válido hasta:</strong> {data.quote.validUntil?.toLocaleDateString("es-AR") ?? "Sin vencimiento"}</p></div>
      <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-[var(--border)] text-[var(--muted)]"><tr><th className="py-3">Ítem</th><th>Cantidad</th><th>Precio</th><th className="text-right">Subtotal</th></tr></thead><tbody>
        {data.items.map((item) => <tr className="border-b border-[var(--border)] last:border-0" key={item.id}><td className="py-4"><div className="quote-detail-item">{item.imageUrlSnapshot ? <span className="quote-detail-thumbnail"><Image src={item.imageUrlSnapshot} alt="" fill sizes="56px" /></span> : <span className="quote-detail-thumbnail quote-detail-thumbnail-placeholder" aria-hidden="true">{item.kind === "product" ? "HC" : "+"}</span>}<span><strong>{item.label}</strong><br/><span className="text-xs text-[var(--muted)]">{item.kind === "product" ? item.skuSnapshot : item.additionalType}</span></span></div></td><td>{item.quantity}</td><td>{money.format(item.unitPriceCents / 100)}</td><td className="text-right font-bold">{money.format(item.subtotalCents / 100)}</td></tr>)}
      </tbody></table></div>
      <div className="mt-6 flex justify-end text-2xl">Total&nbsp; <strong>{money.format(data.quote.totalCents / 100)}</strong></div>
      {data.quote.notes && <div className="mt-6 border-t border-[var(--border)] pt-5"><strong>Notas</strong><p className="mt-2 whitespace-pre-line text-sm text-[var(--muted)]">{data.quote.notes}</p></div>}
    </section>
    <p className="mt-4 text-sm text-[var(--muted)]">Convertir crea una venta en borrador. El stock se descuenta únicamente al confirmarla.</p>
  </main>;
}
