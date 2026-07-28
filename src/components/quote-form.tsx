"use client";

import { useActionState, useMemo, useState } from "react";

import { createQuoteAction, type QuoteActionState } from "@/features/quotes/quotes-admin.actions";

type Product = {
  id: string; name: string; sku: string; storefront: "housecam" | "housepet";
  unitPriceCents: number; pack10PriceCents: number | null; stockOnHand: number; imageUrl: string | null;
};
type Line =
  | { key: string; kind: "product"; productId: string; purchaseMode: "unit" | "pack10"; quantity: number; unitPriceCents: number }
  | { key: string; kind: "additional"; additionalType: "installation" | "shipping" | "other"; label: string; description?: string; quantity: number; unitPriceCents: number };

const initialState: QuoteActionState = { ok: false };
const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0, maximumFractionDigits: 2 });
const makeKey = () => `${Date.now()}-${Math.random()}`;

export function QuoteForm({ products }: { products: Product[] }) {
  const [state, action, pending] = useActionState(createQuoteAction, initialState);
  const [lines, setLines] = useState<Line[]>([]);
  const total = useMemo(() => lines.reduce((sum, line) => sum + line.quantity * line.unitPriceCents, 0), [lines]);

  function addProduct() {
    const product = products[0];
    if (!product) return;
    setLines((current) => [...current, { key: makeKey(), kind: "product", productId: product.id, purchaseMode: "unit", quantity: 1, unitPriceCents: product.unitPriceCents }]);
  }
  function addAdditional() {
    setLines((current) => [...current, { key: makeKey(), kind: "additional", additionalType: "installation", label: "Instalación", quantity: 1, unitPriceCents: 0 }]);
  }
  function update(index: number, patch: Partial<Line>) {
    setLines((current) => current.map((line, itemIndex) => itemIndex === index ? { ...line, ...patch } as Line : line));
  }

  return (
    <form action={action} className="grid gap-6">
      <section className="card grid gap-5 p-6 md:grid-cols-2">
        <label className="admin-field"><span>Cliente</span><input name="customerName" required placeholder="Nombre o razón social" /></label>
        <label className="admin-field"><span>Teléfono</span><input name="customerPhone" placeholder="+54 9…" /></label>
        <label className="admin-field"><span>Email</span><input name="customerEmail" type="email" placeholder="Opcional" /></label>
        <label className="admin-field"><span>Válido hasta</span><input name="validUntil" type="date" /></label>
        <label className="admin-field md:col-span-2"><span>Notas</span><textarea name="notes" rows={3} placeholder="Condiciones, alcance o aclaraciones" /></label>
      </section>

      <section className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-xl font-bold">Ítems</h2><p className="mt-1 text-sm text-[var(--muted)]">Sumá productos del catálogo y servicios o gastos adicionales.</p></div>
          <div className="flex gap-2">
            <button className="admin-secondary-button" type="button" onClick={addProduct} disabled={!products.length}>+ Producto</button>
            <button className="admin-secondary-button" type="button" onClick={addAdditional}>+ Adicional</button>
          </div>
        </div>
        <input type="hidden" name="lines" value={JSON.stringify(lines.map((line) => line.kind === "product"
          ? { kind: line.kind, productId: line.productId, purchaseMode: line.purchaseMode, quantity: line.quantity, unitPriceCents: line.unitPriceCents }
          : { kind: line.kind, additionalType: line.additionalType, label: line.label, description: line.description, quantity: line.quantity, unitPriceCents: line.unitPriceCents }))} />
        <div className="mt-6 grid gap-4">
          {lines.map((line, index) => (
            <div className="quote-line" key={line.key}>
              {line.kind === "product" ? (
                <>
                  <label className="admin-field quote-line-main"><span>Producto</span><select value={line.productId} onChange={(event) => {
                    const product = products.find((item) => item.id === event.target.value)!;
                    update(index, { productId: product.id, purchaseMode: "unit", unitPriceCents: product.unitPriceCents });
                  }}>{products.map((product) => <option value={product.id} key={product.id}>{product.name} · {product.storefront} · stock {product.stockOnHand}</option>)}</select></label>
                  <label className="admin-field"><span>Modalidad</span><select value={line.purchaseMode} onChange={(event) => {
                    const mode = event.target.value as "unit" | "pack10";
                    const product = products.find((item) => item.id === line.productId)!;
                    update(index, { purchaseMode: mode, unitPriceCents: mode === "pack10" ? product.pack10PriceCents ?? product.unitPriceCents * 10 : product.unitPriceCents });
                  }}><option value="unit">Unidad</option><option value="pack10">Pack de 10</option></select></label>
                </>
              ) : (
                <>
                  <label className="admin-field quote-line-main"><span>Concepto</span><input value={line.label} onChange={(event) => update(index, { label: event.target.value })} /></label>
                  <label className="admin-field"><span>Tipo</span><select value={line.additionalType} onChange={(event) => update(index, { additionalType: event.target.value as "installation" | "shipping" | "other" })}><option value="installation">Instalación</option><option value="shipping">Envío</option><option value="other">Otro</option></select></label>
                </>
              )}
              <label className="admin-field"><span>Cantidad</span><input min={1} type="number" value={line.quantity} onChange={(event) => update(index, { quantity: Math.max(1, Number(event.target.value)) })} /></label>
              <label className="admin-field"><span>Precio unitario (ARS)</span><input min={0} step="0.01" type="number" value={(line.unitPriceCents / 100).toFixed(2)} onChange={(event) => update(index, { unitPriceCents: Math.round(Number(event.target.value) * 100) })} /></label>
              <div className="quote-line-total"><span>Subtotal</span><strong>{money.format(line.quantity * line.unitPriceCents / 100)}</strong></div>
              <button className="quote-line-remove" type="button" onClick={() => setLines((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Quitar</button>
            </div>
          ))}
          {!lines.length && <p className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">Todavía no agregaste ítems.</p>}
        </div>
      </section>
      {state.error && <p className="admin-form-error" role="alert">{state.error}</p>}
      <div className="flex flex-wrap items-center justify-end gap-5"><p className="text-lg">Total: <strong>{money.format(total / 100)}</strong></p><button className="admin-primary-button" disabled={pending || !lines.length}>{pending ? "Guardando…" : "Crear presupuesto"}</button></div>
    </form>
  );
}
