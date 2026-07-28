import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  addSaleExpenseAction, addSaleItemAction, cancelSaleAction, confirmSaleAction, removeSaleExpenseAction, removeSaleItemAction,
} from "@/features/sales/sales-admin.actions";
import { getAdminSale, getSaleProductOptions } from "@/features/sales/sales-admin.data";

export const metadata: Metadata = { title: "Detalle de venta" };
const field = "min-h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3";
const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0, maximumFractionDigits: 2 });

export default async function SaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [data, productOptions] = await Promise.all([getAdminSale(id), getSaleProductOptions()]);
  if (!data) notFound();
  const { sale, items, expenses, components } = data;
  const editable = sale.status === "draft";
  return <main className="shell py-10">
    <Link className="text-sm font-bold text-[var(--brand)]" href="/admin/ventas">← Ventas</Link>
    <div className="mt-6 flex flex-wrap items-start justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">{sale.status}</p><h1 className="mt-2 text-3xl font-bold">{sale.code ?? `Venta #${sale.saleNumber}`}</h1><p className="mt-2 text-[var(--muted)]">{sale.customerLabel} · {sale.channel}</p></div>
      {editable && <form action={confirmSaleAction}><input name="saleId" type="hidden" value={sale.id} /><button className="rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white">Confirmar y descontar stock</button></form>}
    </div>

    <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Metric label="Listado" value={money.format(sale.listedTotalCents / 100)} /><Metric label="Descuento" value={money.format(sale.discountTotalCents / 100)} /><Metric label="Costo productos" value={money.format(sale.productCostTotalCents / 100)} /><Metric label="Gastos" value={money.format(sale.expenseTotalCents / 100)} /><Metric label="Margen" value={money.format(sale.profitCents / 100)} />
    </section>

    <section className="card mt-8 p-6"><h2 className="text-xl font-bold">Productos</h2>
      <div className="mt-4 divide-y divide-[var(--border)]">{items.map((item) => <div className="flex flex-wrap items-center justify-between gap-4 py-4" key={item.id}><div><strong>{item.productNameSnapshot}</strong><p className="mt-1 text-sm text-[var(--muted)]">{item.quantity} × {item.purchaseMode === "pack10" ? "pack de 10" : "unidad"} · {money.format(item.finalSubtotalCents / 100)} · costo {money.format(item.historicalCostSubtotalCents / 100)}</p>{components.filter((component) => component.saleItemId === item.id).map((component) => <small className="mr-3 text-[var(--muted)]" key={component.id}>{component.componentNameSnapshot}: {component.physicalUnits} u.</small>)}</div>{editable && <form action={removeSaleItemAction}><input name="saleId" type="hidden" value={sale.id} /><input name="itemId" type="hidden" value={item.id} /><button className="text-sm font-bold text-[var(--brand)]">Quitar</button></form>}</div>)}</div>
      {!items.length && <p className="mt-4 text-sm text-[var(--muted)]">Sin productos.</p>}
      {editable && <form action={addSaleItemAction} className="mt-6 grid gap-3 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]"><input name="saleId" type="hidden" value={sale.id} /><select className={field} name="productId" required><option value="">Producto</option>{productOptions.map((product) => <option value={product.id} key={product.id}>{product.name} · {product.sku} · {product.storefront}</option>)}</select><select className={field} name="purchaseMode"><option value="unit">Unidad</option><option value="pack10">Pack 10</option></select><input className={field} min="1" name="quantity" placeholder="Cantidad" type="number" required /><input aria-label="Precio final en pesos argentinos" className={field} min="0" step="0.01" name="finalUnitPricePesos" placeholder="Precio final (ARS), opcional" type="number" /><button className="rounded-xl border border-[var(--border)] px-4 font-bold">Agregar</button></form>}
    </section>

    <section className="card mt-8 p-6"><h2 className="text-xl font-bold">Gastos</h2><div className="mt-4 divide-y divide-[var(--border)]">{expenses.map((expense) => <div className="flex justify-between gap-4 py-3" key={expense.id}><span>{expense.type} {expense.description && `· ${expense.description}`} · <strong>{money.format(expense.amountCents / 100)}</strong></span>{editable && <form action={removeSaleExpenseAction}><input name="saleId" type="hidden" value={sale.id} /><input name="expenseId" type="hidden" value={expense.id} /><button className="text-sm font-bold text-[var(--brand)]">Quitar</button></form>}</div>)}</div>
      {editable && <form action={addSaleExpenseAction} className="mt-5 grid gap-3 lg:grid-cols-[1fr_2fr_1fr_auto]"><input name="saleId" type="hidden" value={sale.id} /><select className={field} name="type"><option value="shipping">Envío</option><option value="payment_fee">Comisión de pago</option><option value="packaging">Embalaje</option><option value="outsourced_installation">Instalación</option><option value="other">Otro</option></select><input className={field} name="description" placeholder="Descripción" /><input aria-label="Importe del gasto en pesos argentinos" className={field} min="0" step="0.01" name="amountPesos" placeholder="Importe (ARS)" type="number" required /><button className="rounded-xl border border-[var(--border)] px-4 font-bold">Agregar</button></form>}
    </section>

    {sale.status === "confirmed" && <section className="card mt-8 border-red-300 p-6"><h2 className="text-xl font-bold">Anular venta</h2><p className="mt-2 text-sm text-[var(--muted)]">Repone exactamente el stock descontado y registra movimientos compensatorios.</p><form action={cancelSaleAction} className="mt-4 flex flex-wrap gap-3"><input name="saleId" type="hidden" value={sale.id} /><input className={`${field} min-w-72 flex-1`} name="reason" placeholder="Motivo de anulación" required /><button className="rounded-xl bg-red-700 px-5 py-3 font-bold text-white">Anular y reponer stock</button></form></section>}
  </main>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <article className="card p-4"><p className="text-[.68rem] font-bold uppercase tracking-wider text-[var(--muted)]">{label}</p><p className="mt-2 text-lg font-bold">{value}</p></article>;
}
