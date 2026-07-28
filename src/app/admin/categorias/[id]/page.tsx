import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { updateCategoryAction } from "@/features/catalog/catalog-admin.actions";
import { getAdminCategory } from "@/features/catalog/catalog-admin.data";

export const metadata: Metadata = { title: "Editar categoría" };

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await getAdminCategory(id);
  if (!category) notFound();

  return (
    <main className="shell py-10">
      <Link className="text-sm font-semibold text-[var(--brand)]" href="/admin/categorias">← Categorías</Link>
      <h1 className="mt-6 text-3xl font-bold">Editar categoría</h1>
      <form action={updateCategoryAction} className="card mt-8 grid max-w-2xl gap-5 p-6">
        <input name="id" type="hidden" value={category.id} />
        <label className="grid gap-2 text-sm font-semibold">Marca
          <select className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3" name="storefront" defaultValue={category.storefront}>
            <option value="housecam">HouseCam</option><option value="housepet">HousePet</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold">Nombre<input className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3" name="name" defaultValue={category.name} required /></label>
        <label className="grid gap-2 text-sm font-semibold">Slug<input className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3" name="slug" defaultValue={category.slug} required /></label>
        <label className="grid gap-2 text-sm font-semibold">Descripción<textarea className="min-h-28 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3" name="description" defaultValue={category.description ?? ""} /></label>
        <label className="flex items-center gap-2 text-sm"><input defaultChecked={category.isActive} name="isActive" type="checkbox" /> Publicada</label>
        <button className="min-h-11 rounded-xl bg-[var(--brand)] px-5 font-bold text-white" type="submit">Guardar cambios</button>
      </form>
    </main>
  );
}
