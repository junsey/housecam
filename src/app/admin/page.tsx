import type { Metadata } from "next";
import Link from "next/link";

import { requireAdmin } from "@/features/auth/require-admin";

export const metadata: Metadata = { title: "Administración" };

const modules = ["Catálogo", "Solicitudes", "Ventas", "Inventario", "Contenido", "Auditoría"];

export default async function AdminPage() {
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY && process.env.DATABASE_URL) {
    await requireAdmin();
  }

  return (
    <main className="shell py-12">
      <Link href="/" className="text-sm font-semibold text-[var(--brand)]">← Volver al sitio</Link>
      <div className="mt-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">HouseCam Operaciones</p>
        <h1 className="mt-3 text-4xl font-bold tracking-[-0.035em]">Fundamentos administrativos</h1>
        <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">
          Los módulos quedan delimitados en esta fase. Las operaciones de negocio se habilitarán por etapas sobre el esquema versionado.
        </p>
      </div>
      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <article key={module} className="card p-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">Preparado</span>
            <h2 className="mt-3 text-xl font-bold">{module}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Modelo, permisos y trazabilidad definidos.</p>
          </article>
        ))}
      </section>
    </main>
  );
}
