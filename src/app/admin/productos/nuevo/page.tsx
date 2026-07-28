import type { Metadata } from "next";
import Link from "next/link";

import { createProductAction } from "@/features/catalog/catalog-admin.actions";
import { getAdminCategories } from "@/features/catalog/catalog-admin.data";
import { ProductIdentityFields } from "@/components/product-identity-fields";

export const metadata: Metadata = { title: "Nuevo producto" };

const inputClass = "min-h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3";

export default async function NewProductPage() {
  const categories = await getAdminCategories();
  const enabled = categories.configured && categories.items.length > 0;

  return (
    <main className="shell py-10">
      <Link className="text-sm font-semibold text-[var(--brand)]" href="/admin/productos">← Productos</Link>
      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">Catálogo</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em]">Nuevo producto</h1>
      </div>

      {!enabled && (
        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm text-[var(--muted)]">
          <p>Creá al menos una categoría antes de cargar productos.</p>
          <Link className="rounded-xl bg-[var(--brand)] px-4 py-2 font-bold text-white" href="/admin/categorias">
            Crear categoría
          </Link>
        </div>
      )}

      <form action={createProductAction} className="card mt-8 grid gap-6 p-6 md:grid-cols-2">
        <label className="admin-product-field text-sm font-semibold">Marca
          <select className={inputClass} name="storefront" disabled={!enabled}><option value="housecam">HouseCam</option><option value="housepet">HousePet</option></select>
        </label>
        <label className="admin-product-field text-sm font-semibold">Categoría
          <select className={inputClass} name="categoryId" required disabled={!enabled}>
            {categories.items.map((category) => <option value={category.id} key={category.id}>{category.name} · {category.storefront}</option>)}
          </select>
        </label>
        <ProductIdentityFields className={inputClass} disabled={!enabled} />
        <label className="admin-product-field text-sm font-semibold">Tipo
          <select className={inputClass} name="type" disabled={!enabled}><option value="standard">Estándar</option><option value="kit">Kit</option></select>
        </label>
        <label className="admin-product-field text-sm font-semibold">Precio unitario (ARS)<input className={inputClass} min="0" step="0.01" name="unitPricePesos" placeholder="25000,00" type="number" required disabled={!enabled} /></label>
        <label className="admin-product-field text-sm font-semibold">Precio pack de 10 (ARS)<input className={inputClass} min="0" step="0.01" name="pack10PricePesos" placeholder="Opcional" type="number" disabled={!enabled} /></label>
        <label className="admin-product-field text-sm font-semibold">Costo comercial (ARS)<input className={inputClass} min="0" step="0.01" name="commercialCostPesos" placeholder="10000,00" type="number" required disabled={!enabled} /></label>
        <label className="admin-product-field text-sm"><span className="sr-only">Publicación</span><span className="admin-product-checkbox"><input name="isActive" type="checkbox" disabled={!enabled} /> Publicar al crear</span></label>
        <label className="grid gap-2 text-sm font-semibold md:col-span-2">Descripción breve<textarea className="min-h-28 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3" name="shortDescription" disabled={!enabled} /></label>
        <div className="flex justify-end md:col-span-2">
          <button className="min-h-11 rounded-xl bg-[var(--brand)] px-6 font-bold text-white disabled:opacity-40" type="submit" disabled={!enabled}>Crear producto</button>
        </div>
      </form>
    </main>
  );
}
