"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { createSaleAction, type CreateSaleState } from "@/features/sales/sales-admin.actions";

type ProductOption = {
  id: string;
  name: string;
  sku: string;
  storefront: "housecam" | "housepet";
  unitPriceCents: number;
  pack10PriceCents: number | null;
};

const field = "min-h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3";

export function CreateSaleForm({ products }: { products: ProductOption[] }) {
  const [state, action, pending] = useActionState<CreateSaleState, FormData>(createSaleAction, { ok: false });
  const [productId, setProductId] = useState("");
  const [purchaseMode, setPurchaseMode] = useState<"unit" | "pack10">("unit");
  const selected = products.find((product) => product.id === productId);

  return <form action={action} className="card mt-8 grid gap-5 p-6 md:grid-cols-2">
    <label className="grid gap-2 text-sm font-bold">Cliente<input className={field} name="customerLabel" required /></label>
    <label className="grid gap-2 text-sm font-bold">Canal<select className={field} name="channel"><option value="whatsapp">WhatsApp</option><option value="store">Local</option><option value="instagram">Instagram</option><option value="mercado_libre">Mercado Libre</option><option value="wholesale">Mayorista</option><option value="other">Otro</option></select></label>
    <div className="border-t border-[var(--border)] pt-5 md:col-span-2">
      <h2 className="text-xl font-bold">Primer producto</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">Luego podrás agregar más productos y gastos antes de confirmarla.</p>
    </div>
    <label className="grid gap-2 text-sm font-bold">Producto<select className={field} name="productId" required value={productId} onChange={(event) => {
      const nextId = event.target.value;
      setProductId(nextId);
      if (!products.find((product) => product.id === nextId)?.pack10PriceCents) setPurchaseMode("unit");
    }}><option disabled value="">Seleccionar producto</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.sku} · {product.storefront}</option>)}</select></label>
    <label className="grid gap-2 text-sm font-bold">Modalidad<select className={field} name="purchaseMode" value={purchaseMode} onChange={(event) => setPurchaseMode(event.target.value as "unit" | "pack10")}><option value="unit">Unidad</option>{selected?.pack10PriceCents !== null && selected?.pack10PriceCents !== undefined && <option value="pack10">Pack de 10</option>}</select></label>
    <label className="grid gap-2 text-sm font-bold">Cantidad<input className={field} min="1" name="quantity" required type="number" defaultValue="1" /></label>
    <label className="grid gap-2 text-sm font-bold">Precio final unitario (ARS, opcional)<input className={field} min="0" name="finalUnitPricePesos" step="0.01" type="number" /></label>
    <label className="grid gap-2 text-sm font-bold md:col-span-2">Notas<textarea className="min-h-28 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3" name="notes" /></label>
    {state.error && <p className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm font-semibold text-red-700 md:col-span-2" role="alert">{state.error}</p>}
    <div className="flex flex-wrap justify-end gap-3 md:col-span-2"><Link className="rounded-xl border border-[var(--border)] px-6 py-3 font-bold" href="/admin/ventas">Cancelar</Link><button className="rounded-xl bg-[var(--brand)] px-6 py-3 font-bold text-white" disabled={!products.length || pending}>{pending ? "Creando venta…" : "Crear venta"}</button></div>
  </form>;
}
