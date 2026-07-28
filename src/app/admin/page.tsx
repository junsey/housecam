import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Administración" };

const modules = [
  { name: "Productos", description: "Alta, publicación, costos y archivo.", href: "/admin/productos", state: "Operativo con DB" },
  { name: "Categorías", description: "Organización separada por marca.", href: "/admin/categorias", state: "Operativo con DB" },
  { name: "Solicitudes", description: "Modelo y estados preparados.", state: "Preparado" },
  { name: "Ventas", description: "Borradores, confirmación, gastos, margen y CSV.", href: "/admin/ventas", state: "Fase 3" },
  { name: "Inventario", description: "Descuento y reposición transaccional auditada.", href: "/admin/ventas", state: "Fase 3" },
  { name: "Contenido", description: "Configuración base preparada.", state: "Preparado" },
] as const;

export default function AdminPage() {
  return (
    <main className="shell py-12">
      <div className="mt-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Fases 2 y 3</p>
        <h1 className="mt-3 text-4xl font-bold tracking-[-0.035em]">Operación HouseCam</h1>
        <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">
          Catálogo, stock y ventas comparten una operación auditada. Para activarla falta configurar Neon, Clerk y Blob.
        </p>
      </div>
      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <article key={module.name} className="card p-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">{module.state}</span>
            <h2 className="mt-3 text-xl font-bold">{module.name}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{module.description}</p>
            {"href" in module && (
              <Link className="mt-5 inline-flex font-semibold text-[var(--brand)]" href={module.href}>Abrir módulo →</Link>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
