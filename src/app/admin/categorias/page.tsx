import type { Metadata } from "next";
import Link from "next/link";

import { CategoryIdentityFields } from "@/components/category-identity-fields";
import { archiveCategoryAction, createCategoryAction, restoreCategoryAction } from "@/features/catalog/catalog-admin.actions";
import { getAdminCategories, getArchivedCategories } from "@/features/catalog/catalog-admin.data";

export const metadata: Metadata = { title: "Categorías" };
const fieldClass = "min-h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ archivadas?: string; error?: string; restaurada?: string }>;
}) {
  const query = await searchParams;
  const showingArchived = query.archivadas === "1";
  const [result, archived] = await Promise.all([getAdminCategories(), getArchivedCategories()]);
  const displayedCategories = showingArchived ? archived.map((category) => ({ ...category, activeProductCount: 0 })) : result.items;

  return (
    <main className="shell py-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">Catálogo</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em]">Categorías</h1>
          <p className="mt-3 text-[var(--muted)]">Cada categoría pertenece exclusivamente a HouseCam o HousePet.</p>
        </div>
        <Link className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-bold" href={showingArchived ? "/admin/categorias" : "/admin/categorias?archivadas=1"}>
          {showingArchived ? "Ver activas" : `Ver archivadas (${archived.length})`}
        </Link>
      </div>

      {query.error === "categoria-en-uso" && (
        <p className="mt-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm font-semibold">
          No se puede archivar la categoría porque todavía tiene productos activos. Archivá o reasigná esos productos primero.
        </p>
      )}
      {query.restaurada === "1" && (
        <p className="mt-6 rounded-2xl border border-[var(--hc-success)]/40 bg-[var(--hc-success-light)] p-4 text-sm font-semibold text-[var(--hc-success)]">
          Categoría restaurada como no publicada.
        </p>
      )}

      {!result.configured && (
        <p className="mt-7 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm text-[var(--muted)]">
          Modo de configuración: agregá <code>DATABASE_URL</code> y Clerk para habilitar altas y cambios.
        </p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="card overflow-hidden" aria-labelledby="category-list-title">
          <div className="border-b border-[var(--border)] p-5">
            <h2 className="font-bold" id="category-list-title">{showingArchived ? "Categorías archivadas" : "Categorías activas"}</h2>
          </div>
          {displayedCategories.length === 0 ? (
            <p className="p-6 text-sm text-[var(--muted)]">{showingArchived ? "No hay categorías archivadas." : "Todavía no hay categorías cargadas."}</p>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {displayedCategories.map((category) => (
                <article className="flex items-center justify-between gap-5 p-5" key={category.id}>
                  <div>
                    {!showingArchived ? <Link className="font-bold hover:text-[var(--brand)]" href={`/admin/categorias/${category.id}`}>{category.name}</Link> : <p className="font-bold">{category.name}</p>}
                    <p className="mt-1 text-sm text-[var(--muted)]">{category.storefront} · /{category.slug}</p>
                  </div>
                  {showingArchived ? (
                    <form action={restoreCategoryAction}>
                      <input name="id" type="hidden" value={category.id} />
                      <button className="rounded-full border border-[var(--border)] px-3 py-2 text-xs font-bold" type="submit">Restaurar</button>
                    </form>
                  ) : category.activeProductCount > 0 ? (
                    <span className="max-w-40 text-right text-xs font-semibold text-[var(--muted)]">
                      En uso por {category.activeProductCount} producto{category.activeProductCount === 1 ? "" : "s"}
                    </span>
                  ) : (
                    <form action={archiveCategoryAction}>
                      <input name="id" type="hidden" value={category.id} />
                      <button className="rounded-full border border-[var(--border)] px-3 py-2 text-xs font-bold" type="submit">Archivar</button>
                    </form>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="card p-6" aria-labelledby="new-category-title">
          <h2 className="font-bold" id="new-category-title">Nueva categoría</h2>
          <form action={createCategoryAction} className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold">Marca
              <select className={fieldClass} name="storefront" disabled={!result.configured}>
                <option value="housecam">HouseCam</option>
                <option value="housepet">HousePet</option>
              </select>
            </label>
            <CategoryIdentityFields fieldClass={fieldClass} disabled={!result.configured} />
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
