import type { Metadata } from "next";
import Link from "next/link";

import { updateWhatsappSettingsAction } from "@/features/catalog/catalog-admin.actions";
import { getWhatsappSettings } from "@/features/catalog/catalog-admin.data";
import { getWhatsappHref } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Configuración de WhatsApp" };

export default async function WhatsappSettingsPage({ searchParams }: { searchParams: Promise<{ edit?: string; guardado?: string }> }) {
  const query = await searchParams;
  const settings = await getWhatsappSettings();
  const editing = query.edit === "1";
  const previewHref = getWhatsappHref(settings.value, "Hola, quiero conocer más sobre las soluciones HouseCam.");

  return (
    <main className="shell py-10">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">Configuración</p>
      <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em]">WhatsApp</h1>
      <p className="mt-3 max-w-2xl text-[var(--muted)]">Este número centraliza todos los llamados comerciales de HouseCam y HousePet.</p>
      {query.guardado === "1" && <p className="mt-6 rounded-2xl border border-[var(--hc-success)]/40 bg-[var(--hc-success-light)] p-4 text-sm font-semibold text-[var(--hc-success)]">Configuración guardada y sitio público actualizado.</p>}
      {!settings.configured && <p className="mt-7 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm text-[var(--muted)]">Conectá Neon y Clerk para guardar la configuración.</p>}

      {!editing ? (
        <section className="card mt-8 max-w-xl p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Número configurado</p>
              <p className="mt-3 text-2xl font-bold">{settings.value || "Sin número configurado"}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">{settings.value ? "Los contactos públicos están habilitados." : "Los botones públicos informarán que el contacto está temporalmente deshabilitado."}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${settings.value ? "bg-[var(--hc-success-light)] text-[var(--hc-success)]" : "bg-[var(--background)] text-[var(--muted)]"}`}>{settings.value ? "Activo" : "Deshabilitado"}</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-bold text-white" href="/admin/configuracion/whatsapp?edit=1">Editar</Link>
            {previewHref && <a className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-bold" href={previewHref} target="_blank" rel="noopener noreferrer">Probar enlace</a>}
          </div>
        </section>
      ) : (
        <form action={updateWhatsappSettingsAction} className="card mt-8 grid max-w-xl gap-5 p-6">
          <label className="grid gap-2 text-sm font-semibold">Número internacional
            <input className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3" name="whatsappNumber" defaultValue={settings.value} placeholder="+54 9 351 000 0000" disabled={!settings.configured} />
          </label>
          <p className="text-xs leading-5 text-[var(--muted)]">Incluí código de país y área. Podés dejarlo vacío para deshabilitar temporalmente los contactos públicos.</p>
          <div className="flex flex-wrap justify-end gap-3">
            <Link className="rounded-xl border border-[var(--border)] px-5 py-3 font-bold" href="/admin/configuracion/whatsapp">Cancelar</Link>
            <button className="rounded-xl bg-[var(--brand)] px-5 py-3 font-bold text-white disabled:opacity-40" disabled={!settings.configured}>Guardar configuración</button>
          </div>
        </form>
      )}
    </main>
  );
}
