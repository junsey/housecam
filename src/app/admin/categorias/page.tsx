import type { Metadata } from "next";

import { archiveCategoryAction, createCategoryAction } from "@/features/catalog/catalog-admin.actions";
import { getAdminCategories } from "@/features/catalog/catalog-admin.data";

export const metadata: Metadata = { title: "Categorías" };

export default async function AdminCategoriesPage() {
  const result = await getAdminCategories();

  return (
    <main className="shell py-10">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">Catálogo</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em]">Categorías</h1>
        <p className="mt-3 text-[var(--muted)]">Cada categoría pertenece exclusivamente a HouseCam o HousePet.</p>
      </div>

      {!result.configured && (
        <p className="mt-7 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm text-[var(--muted)]">
          Modo de configuración: agregá <code>DATABASE_URL</code> y Clerk para habilitar altas y cambios.
        </p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="card overflow-hidden" aria-labelledby="category-list-title">
          <div className="border-b border-[var(--border)] p-5">
            <h2 className="font-bold" id="category-list-title">Categorías activas</h2>
          </div>
          {result.items.length === 0 ? (
            <p className="p-6 text-sm text-[var(--muted)]">Todavía no hay categorías cargadas.</p>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {result.items.map((category) => (
                <article className="flex items-center justify-between gap-5 p-5" key={category.id}>
                  <div>
                    <p className="font-bold">{category.name}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{category.storefront} · /{category.slug}</p>
                  </div>
                  <form action={archiveCategoryAction}>
                    <input name="id" type="hidden" value={category.id} />
                    <button className="rounded-full border border-[var(--border)] px-3 py-2 text-xs font-bold" type="submit">Archivar</button>
                  </form>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="card p-6" aria-labelledby="new-category-title">
          <h2 className="font-bold" id="new-category-title">Nueva categoría</h2>
          <form action={createCategoryAction} className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold">Marca
              <select className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3" name="storefront" disabled={!result.configured}>
                <option value="housecam">HouseCam</option>
                <option value="housepet">HousePet</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold">Nombre
              <input className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3" name="name" required disabled={!result.configured} />
            </label>
            <label className="grid gap-2 text-sm font-semibold">Slug
              <input className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3" name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required disabled={!result.configured} />
            </label>
            <label className="grid gap-2 text-sm font-semibold">Descripción
              <textarea className="min-h-24 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3" name="description" disabled={!result.configured} />
            </label>
            <label className="flex items-center gap-2 text-sm"><input defaultChecked name="isActive" type="checkbox" disabled={!result.configured} /> Publicada</label>
            <button className="min-h-11 rounded-xl bg-[var(--brand)] px-4 font-bold text-white disabled:opacity-40" type="submit" disabled={!result.configured}>Crear categoría</button>
          </form>
        </section>
      </div>
    </main>
  );
}
