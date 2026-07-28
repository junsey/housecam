import type { Metadata } from "next";
import Link from "next/link";

import { getAdminDashboardMetrics } from "@/features/admin/admin-dashboard.data";

export const metadata: Metadata = { title: "Administración" };
export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export default async function AdminPage() {
  const metrics = await getAdminDashboardMetrics();
  const modules = [
    { name: "Productos", value: String(metrics.productCount), detail: "productos cargados", description: "Alta, publicación, costos y archivo.", href: "/admin/productos" },
    { name: "Categorías", value: String(metrics.categoryCount), detail: "categorías activas", description: "Organización separada por marca.", href: "/admin/categorias" },
    { name: "Ventas", value: String(metrics.confirmedSaleCount), detail: "ventas confirmadas", description: "Borradores, confirmación, gastos y margen.", href: "/admin/ventas" },
    { name: "Inventario", value: String(metrics.inventoryUnits), detail: "unidades disponibles", description: "Stock físico total de productos estándar.", href: "/admin/productos" },
    { name: "Balance", value: money.format(metrics.balanceCents / 100), detail: "margen acumulado", description: "Resultado de las ventas confirmadas.", href: "/admin/ventas" },
  ] as const;

  return (
    <main className="admin-dashboard">
      <section className="admin-dashboard-hero">
        <div className="admin-dashboard-hero-texture" />
        <div className="shell admin-dashboard-hero-content">
          <p className="admin-dashboard-eyebrow">Panel administrativo</p>
          <h1>Operación HouseCam</h1>
          <p className="admin-dashboard-lead">
            Catálogo, stock y ventas comparten una operación centralizada y auditada.
          </p>
        </div>
      </section>

      <section className="shell mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <article key={module.name} className="card admin-dashboard-card p-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">{module.detail}</span>
            <p className="mt-3 text-4xl font-bold tracking-[-0.04em] text-[var(--brand)]">{module.value}</p>
            <h2 className="mt-3 text-xl font-bold">{module.name}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{module.description}</p>
            <Link className="mt-5 inline-flex font-semibold text-[var(--brand)]" href={module.href}>Abrir módulo →</Link>
          </article>
        ))}
      </section>
    </main>
  );
}
