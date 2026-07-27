import Link from "next/link";

const adminNavigation = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/configuracion/whatsapp", label: "WhatsApp" },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="shell flex min-h-20 flex-wrap items-center justify-between gap-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">HouseCam</p>
            <p className="mt-1 font-bold">Administración</p>
          </div>
          <nav className="flex flex-wrap items-center gap-2" aria-label="Navegación administrativa">
            {adminNavigation.map((item) => (
              <Link className="rounded-full px-4 py-2 text-sm font-semibold hover:bg-[var(--background)]" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
            <a className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold" href="/desarrollo">
              Ver sitio
            </a>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
