import type { Metadata } from "next";
import Link from "next/link";

import { archiveProductAction } from "@/features/catalog/catalog-admin.actions";
import { getAdminProducts } from "@/features/catalog/catalog-admin.data";

export const metadata: Metadata = { title: "Productos" };

const currency = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

export default async function AdminProductsPage() {
  const result = await getAdminProducts();

  return (
    <main className="shell py-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">Catálogo</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em]">Productos</h1>
          <p className="mt-3 text-[var(--muted)]">Precios, costos, publicación y archivo lógico.</p>
        </div>
        <Link className="rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-bold text-white" href="/admin/productos/nuevo">Nuevo producto</Link>
      </div>

      {!result.configured && (
        <p className="mt-7 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm text-[var(--muted)]">
          Modo de configuración: el listado se habilita al conectar Neon y Clerk.
        </p>
      )}

      <section className="card mt-8 overflow-x-auto">
        {result.items.length === 0 ? (
          <p className="p-6 text-sm text-[var(--muted)]">Todavía no hay productos cargados.</p>
        ) : (
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="border-b border-[var(--border)] text-xs uppercase tracking-wider text-[var(--muted)]">
              <tr><th className="p-4">Producto</th><th className="p-4">Marca</th><th className="p-4">Precio</th><th className="p-4">Stock</th><th className="p-4">Estado</th><th className="p-4"><span className="sr-only">Acciones</span></th></tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {result.items.map((product) => (
                <tr key={product.id}>
                  <td className="p-4"><Link className="font-bold hover:text-[var(--brand)]" href={`/admin/productos/${product.id}`}>{product.name}</Link><span className="mt-1 block text-xs text-[var(--muted)]">{product.sku} · {product.categoryName}</span></td>
                  <td className="p-4 capitalize">{product.storefront}</td>
                  <td className="p-4">{currency.format(product.unitPriceCents / 100)}</td>
                  <td className="p-4">{product.type === "kit" ? "Por componentes" : product.stockOnHand}</td>
                  <td className="p-4">{product.isActive ? "Publicado" : "Borrador"}</td>
                  <td className="p-4">
                    <form action={archiveProductAction}>
                      <input name="id" type="hidden" value={product.id} />
                      <button className="rounded-full border border-[var(--border)] px-3 py-2 text-xs font-bold" type="submit">Archivar</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
