import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  addProductSpecAction, adjustStockAction, deleteProductImageAction, deleteProductSpecAction,
  deleteKitComponentAction, duplicateProductAction, setProductCoverAction, toggleProductPublicationAction,
  updateProductAction, uploadProductImageAction, upsertKitComponentAction,
} from "@/features/catalog/catalog-admin.actions";
import { getAdminCategories, getAdminProduct } from "@/features/catalog/catalog-admin.data";

export const metadata: Metadata = { title: "Editar producto" };
const fieldClass = "min-h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [data, categoryResult] = await Promise.all([getAdminProduct(id), getAdminCategories()]);
  if (!data) notFound();
  const { product, specs, images, components, componentOptions, kitSummary } = data;

  return (
    <main className="shell py-10">
      <Link className="text-sm font-semibold text-[var(--brand)]" href="/admin/productos">← Productos</Link>
      <div className="mt-6 flex flex-wrap items-start justify-between gap-5">
        <div><p className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">{product.sku}</p><h1 className="mt-2 text-3xl font-bold">{product.name}</h1></div>
        <div className="flex flex-wrap gap-2">
          <form action={duplicateProductAction}><input name="id" type="hidden" value={product.id} /><button className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-bold">Duplicar</button></form>
          <form action={toggleProductPublicationAction}>
            <input name="id" type="hidden" value={product.id} /><input name="isActive" type="hidden" value={String(!product.isActive)} />
            <button className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white">{product.isActive ? "Pasar a borrador" : "Publicar"}</button>
          </form>
        </div>
      </div>

      <form action={updateProductAction} className="card mt-8 grid gap-5 p-6 md:grid-cols-2">
        <input name="id" type="hidden" value={product.id} />
        <label className="grid gap-2 text-sm font-semibold">Marca<select className={fieldClass} name="storefront" defaultValue={product.storefront}><option value="housecam">HouseCam</option><option value="housepet">HousePet</option></select></label>
        <label className="grid gap-2 text-sm font-semibold">Categoría<select className={fieldClass} name="categoryId" defaultValue={product.categoryId}>{categoryResult.items.map((category) => <option value={category.id} key={category.id}>{category.name} · {category.storefront}</option>)}</select></label>
        <label className="grid gap-2 text-sm font-semibold">Nombre<input className={fieldClass} name="name" defaultValue={product.name} required /></label>
        <label className="grid gap-2 text-sm font-semibold">SKU<input className={fieldClass} value={product.sku} readOnly disabled /><small className="font-normal text-[var(--muted)]">Código único generado por HouseCam.</small></label>
        <label className="grid gap-2 text-sm font-semibold">Slug<input className={fieldClass} name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={product.slug} required /><small className="font-normal text-[var(--muted)]">Solo minúsculas, números y guiones medios; por ejemplo: camara-wifi-exterior.</small></label>
        <label className="grid gap-2 text-sm font-semibold">Tipo<select className={fieldClass} name="type" defaultValue={product.type}><option value="standard">Estándar</option><option value="kit">Kit</option></select></label>
        <label className="grid gap-2 text-sm font-semibold">Precio unitario (ARS)<input className={fieldClass} name="unitPricePesos" type="number" min="0" step="0.01" defaultValue={product.unitPriceCents / 100} required /></label>
        <label className="grid gap-2 text-sm font-semibold">Precio pack de 10 (ARS)<input className={fieldClass} name="pack10PricePesos" type="number" min="0" step="0.01" defaultValue={product.pack10PriceCents === null ? "" : product.pack10PriceCents / 100} /></label>
        <label className="grid gap-2 text-sm font-semibold">Costo comercial (ARS)<input className={fieldClass} name="commercialCostPesos" type="number" min="0" step="0.01" defaultValue={product.commercialCostCents / 100} required /></label>
        <label className="flex items-center gap-2 self-end pb-3 text-sm"><input name="isActive" type="checkbox" defaultChecked={product.isActive} /> Publicado</label>
        <label className="grid gap-2 text-sm font-semibold md:col-span-2">Descripción breve<textarea className="min-h-28 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3" name="shortDescription" defaultValue={product.shortDescription ?? ""} /></label>
        <div className="flex justify-end md:col-span-2"><button className="rounded-xl bg-[var(--brand)] px-6 py-3 font-bold text-white">Guardar producto</button></div>
      </form>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="text-xl font-bold">Especificaciones</h2>
          <div className="mt-5 divide-y divide-[var(--border)]">
            {specs.map((spec) => <div className="flex items-center justify-between gap-4 py-3" key={spec.id}><span><strong>{spec.label}</strong>: {spec.value}</span><form action={deleteProductSpecAction}><input name="id" type="hidden" value={spec.id} /><input name="productId" type="hidden" value={product.id} /><button className="text-xs font-bold text-[var(--brand)]">Eliminar</button></form></div>)}
            {!specs.length && <p className="py-3 text-sm text-[var(--muted)]">Sin especificaciones.</p>}
          </div>
          <form action={addProductSpecAction} className="mt-5 grid gap-3 sm:grid-cols-2">
            <input name="productId" type="hidden" value={product.id} />
            <input className={fieldClass} name="label" placeholder="Etiqueta" required />
            <input className={fieldClass} name="value" placeholder="Valor" required />
            <button className="rounded-xl border border-[var(--border)] px-4 py-2 font-bold sm:col-span-2">Agregar especificación</button>
          </form>
        </section>

        <section className="card p-6">
          <h2 className="text-xl font-bold">Stock físico</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">{product.type === "kit" ? "Los kits calculan stock desde componentes." : `Stock actual: ${product.stockOnHand}`}</p>
          <form action={adjustStockAction} className="mt-5 grid gap-3">
            <input name="productId" type="hidden" value={product.id} />
            <input className={fieldClass} name="delta" type="number" placeholder="Ajuste: 10 o -2" required disabled={product.type === "kit"} />
            <input className={fieldClass} name="note" placeholder="Motivo del ajuste" required disabled={product.type === "kit"} />
            <button className="rounded-xl border border-[var(--border)] px-4 py-2 font-bold disabled:opacity-40" disabled={product.type === "kit"}>Registrar ajuste auditado</button>
          </form>
        </section>
      </div>

      {product.type === "kit" && (
        <section className="card mt-8 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Componentes del kit</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">El precio de venta se carga manualmente. El costo material y la disponibilidad se calculan desde estos productos.</p>
            </div>
            <div className="rounded-xl bg-[var(--background)] px-4 py-3 text-sm">
              <strong>Costo material:</strong> ${((kitSummary?.materialCostCents ?? 0) / 100).toLocaleString("es-AR")} · <strong>Disponibles:</strong> {kitSummary?.availability ?? 0}
            </div>
          </div>
          <div className="mt-5 divide-y divide-[var(--border)]">
            {components.map((component) => (
              <div className="flex flex-wrap items-center justify-between gap-4 py-3" key={component.id}>
                <span><strong>{component.name}</strong> ({component.sku}) · {component.quantity} por kit · stock {component.stockOnHand}</span>
                <form action={deleteKitComponentAction}>
                  <input name="kitProductId" type="hidden" value={product.id} />
                  <input name="componentProductId" type="hidden" value={component.id} />
                  <button className="text-xs font-bold text-[var(--brand)]">Quitar</button>
                </form>
              </div>
            ))}
            {!components.length && <p className="py-3 text-sm text-[var(--muted)]">Todavía no hay componentes. El kit no puede publicarse.</p>}
          </div>
          <form action={upsertKitComponentAction} className="mt-5 grid gap-3 md:grid-cols-[1fr_160px_auto]">
            <input name="kitProductId" type="hidden" value={product.id} />
            <select className={fieldClass} name="componentProductId" required>
              <option value="">Elegí un producto estándar</option>
              {componentOptions.map((component) => <option key={component.id} value={component.id}>{component.name} · {component.sku}</option>)}
            </select>
            <input className={fieldClass} min="1" name="quantity" placeholder="Cantidad" required type="number" />
            <button className="rounded-xl border border-[var(--border)] px-5 py-2 font-bold">Agregar o actualizar</button>
          </form>
        </section>
      )}

      <section className="card mt-8 p-6">
        <h2 className="text-xl font-bold">Imágenes</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {images.map((image) => (
            <article className="overflow-hidden rounded-2xl border border-[var(--border)]" key={image.id}>
              <div className="relative aspect-square"><Image src={image.url} alt={image.alt} fill className="object-cover" /></div>
              <div className="p-3"><p className="text-xs text-[var(--muted)]">{image.alt}</p><div className="mt-3 flex flex-wrap gap-2">
                {!image.isCover && <form action={setProductCoverAction}><input name="id" type="hidden" value={image.id} /><input name="productId" type="hidden" value={product.id} /><button className="text-xs font-bold text-[var(--brand)]">Hacer portada</button></form>}
                {image.isCover && <span className="text-xs font-bold text-[var(--brand)]">Portada</span>}
                <form action={deleteProductImageAction}><input name="id" type="hidden" value={image.id} /><input name="productId" type="hidden" value={product.id} /><button className="text-xs font-bold">Eliminar</button></form>
              </div></div>
            </article>
          ))}
        </div>
        <form action={uploadProductImageAction} className="mt-6 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input name="productId" type="hidden" value={product.id} />
          <input className={fieldClass} name="file" type="file" accept="image/png,image/jpeg,image/webp" required />
          <input className={fieldClass} name="alt" placeholder="Texto alternativo" required />
          <button className="rounded-xl bg-[var(--brand)] px-5 py-2 font-bold text-white">Subir imagen</button>
        </form>
      </section>
    </main>
  );
}
