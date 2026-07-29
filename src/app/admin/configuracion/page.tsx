import type { Metadata, Route } from "next";
import Link from "next/link";

import { updateDevelopmentModeAction, updateHomeAppSectionAction, updateWhatsappSettingsAction } from "@/features/catalog/catalog-admin.actions";
import { getGeneralSiteSettings } from "@/features/catalog/catalog-admin.data";
import { getWhatsappHref } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Configuración" };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ edit?: string; guardado?: string; estado?: string }> }) {
  const query = await searchParams;
  const settings = await getGeneralSiteSettings();
  const editingWhatsapp = query.edit === "whatsapp";
  const previewHref = getWhatsappHref(settings.whatsappNumber, "Hola, quiero conocer más sobre las soluciones HouseCam.");

  return <main className="shell py-10">
    <header className="admin-settings-page-header">
      <p>Administración</p>
      <h1>Configuración</h1>
      <span>Administrá la disponibilidad del sitio y sus canales generales de contacto.</span>
    </header>
    {query.guardado && <p className="mt-6 rounded-2xl border border-[var(--hc-success)]/40 bg-[var(--hc-success-light)] p-4 text-sm font-semibold text-[var(--hc-success)]">
      {query.guardado === "desarrollo"
        ? `Modo de desarrollo ${query.estado === "activo" ? "activado" : "desactivado"}.`
        : query.guardado === "aplicacion"
          ? `Sección de la aplicación ${query.estado === "activo" ? "activada" : "desactivada"}.`
          : "Configuración de WhatsApp guardada."}
    </p>}
    {!settings.configured && <p className="mt-7 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm text-[var(--muted)]">Conectá Neon y Clerk para guardar la configuración.</p>}

    <div className="mt-8 grid gap-5 lg:grid-cols-2">
      <section className="card p-6">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">Página principal</p>
            <h2 className="mt-2 text-2xl font-bold">Aplicación HouseCam</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Controlá si la Home muestra la sección dedicada a la aplicación móvil.</p>
          </div>
          <span className={`admin-setting-status ${settings.homeAppSectionEnabled ? "is-enabled" : ""}`}>{settings.homeAppSectionEnabled ? "Activo" : "Inactivo"}</span>
        </div>
        <form action={updateHomeAppSectionAction} className="mt-7">
          <input name="enabled" type="hidden" value={settings.homeAppSectionEnabled ? "false" : "true"} />
          <button className="admin-setting-toggle" disabled={!settings.configured} type="submit" aria-label={settings.homeAppSectionEnabled ? "Ocultar sección Aplicación HouseCam" : "Mostrar sección Aplicación HouseCam"}>
            <span className={`admin-setting-switch ${settings.homeAppSectionEnabled ? "is-enabled" : ""}`} aria-hidden="true"><span /></span>
            <span>{settings.homeAppSectionEnabled ? "Ocultar sección “Aplicación HouseCam”" : "Mostrar sección “Aplicación HouseCam”"}</span>
          </button>
        </form>
      </section>

      <section className="card p-6">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">Publicación</p>
            <h2 className="mt-2 text-2xl font-bold">Modo de desarrollo</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{settings.developmentModeEnabled
              ? "La portada temporal está visible. El sitio real continúa disponible como vista previa."
              : "La portada pública dirige directamente al sitio real."}</p>
          </div>
          <span className={`admin-setting-status ${settings.developmentModeEnabled ? "is-enabled" : ""}`}>{settings.developmentModeEnabled ? "Activo" : "Inactivo"}</span>
        </div>
        <form action={updateDevelopmentModeAction} className="mt-7">
          <input name="enabled" type="hidden" value={settings.developmentModeEnabled ? "false" : "true"} />
          <button className="admin-setting-toggle" disabled={!settings.configured} type="submit" aria-label={settings.developmentModeEnabled ? "Desactivar modo de desarrollo" : "Activar modo de desarrollo"}>
            <span className={`admin-setting-switch ${settings.developmentModeEnabled ? "is-enabled" : ""}`} aria-hidden="true"><span /></span>
            <span>{settings.developmentModeEnabled ? "Desactivar modo de desarrollo" : "Activar modo de desarrollo"}</span>
          </button>
        </form>
        <div className="mt-5 flex flex-wrap gap-3">
          <a className="admin-secondary-button" href="/vista-previa-desarrollo" target="_blank" rel="noopener noreferrer">Vista previa de pantalla de desarrollo</a>
          <a className="admin-secondary-button" href="/" target="_blank" rel="noopener noreferrer">Ver home del sitio actual</a>
        </div>
      </section>

      <section className="card p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">Contacto</p>
        <h2 className="mt-2 text-2xl font-bold">WhatsApp</h2>
        {!editingWhatsapp ? <>
          <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Número configurado</p><p className="mt-3 text-xl font-bold">{settings.whatsappNumber || "Sin número configurado"}</p><p className="mt-2 text-sm text-[var(--muted)]">{settings.whatsappNumber ? "Los contactos públicos están habilitados." : "Los botones públicos mostrarán contacto no disponible."}</p></div>
            <span className={`admin-setting-status ${settings.whatsappNumber ? "is-enabled" : ""}`}>{settings.whatsappNumber ? "Activo" : "Deshabilitado"}</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3"><Link className="admin-primary-button" href={"/admin/configuracion?edit=whatsapp" as Route}>Editar</Link>{previewHref && <a className="admin-secondary-button" href={previewHref} target="_blank" rel="noopener noreferrer">Probar enlace</a>}</div>
        </> : <form action={updateWhatsappSettingsAction} className="mt-5 grid gap-5">
          <label className="admin-field"><span>Número internacional</span><input name="whatsappNumber" defaultValue={settings.whatsappNumber} placeholder="+54 9 351 000 0000" disabled={!settings.configured} /></label>
          <p className="text-xs leading-5 text-[var(--muted)]">Incluí código de país y área. Podés dejarlo vacío para deshabilitar temporalmente los contactos públicos.</p>
          <div className="flex flex-wrap justify-end gap-3"><Link className="admin-secondary-button" href={"/admin/configuracion" as Route}>Cancelar</Link><button className="admin-primary-button" disabled={!settings.configured}>Guardar WhatsApp</button></div>
        </form>}
      </section>
    </div>
  </main>;
}
