import type { Metadata } from "next";

import { updateWhatsappSettingsAction } from "@/features/catalog/catalog-admin.actions";
import { getWhatsappSettings } from "@/features/catalog/catalog-admin.data";

export const metadata: Metadata = { title: "Configuración de WhatsApp" };

export default async function WhatsappSettingsPage() {
  const settings = await getWhatsappSettings();

  return (
    <main className="shell py-10">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">Configuración</p>
      <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em]">WhatsApp</h1>
      <p className="mt-3 max-w-2xl text-[var(--muted)]">Este número se utilizará en los llamados a la acción y quedará registrado en las solicitudes.</p>
      {!settings.configured && <p className="mt-7 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm text-[var(--muted)]">Conectá Neon y Clerk para guardar la configuración.</p>}
      <form action={updateWhatsappSettingsAction} className="card mt-8 grid max-w-xl gap-5 p-6">
        <label className="grid gap-2 text-sm font-semibold">Número internacional
          <input className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3" name="whatsappNumber" defaultValue={settings.value} placeholder="+54 9 351 000 0000" required disabled={!settings.configured} />
        </label>
        <p className="text-xs leading-5 text-[var(--muted)]">Incluí código de país y área. No se guarda un número hardcodeado en el sitio.</p>
        <button className="min-h-11 rounded-xl bg-[var(--brand)] px-5 font-bold text-white disabled:opacity-40" disabled={!settings.configured}>Guardar configuración</button>
      </form>
    </main>
  );
}
