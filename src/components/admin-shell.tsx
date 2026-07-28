"use client";

import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";

const adminNavigation = [
  { href: "/admin", label: "Resumen", exact: true },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/ventas", label: "Ventas" },
  { href: "/admin/configuracion/whatsapp", label: "WhatsApp" },
] as const;

export function AdminShell({ children, clerkConfigured }: { children: React.ReactNode; clerkConfigured: boolean }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileNavigationRef = useRef<HTMLDivElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: PointerEvent) {
      if (!mobileNavigationRef.current?.contains(event.target as Node)) setMobileMenuOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setMobileMenuOpen(false);
      mobileTriggerRef.current?.focus();
    }
    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="admin-root">
      <header className="admin-header">
        <div className="shell admin-header-inner">
          <Link className="admin-brand" href="/admin" aria-label="Administración HouseCam">
            <span className="admin-logo-pair">
              <Image className="admin-logo logo-dark-theme" src="/housecam-white.svg" alt="HouseCam" width={190} height={58} priority />
              <Image className="admin-logo logo-light-theme" src="/housecam-black.svg" alt="HouseCam" width={190} height={58} priority />
            </span>
            <span className="admin-brand-divider" aria-hidden="true" />
            <span className="admin-brand-label">Administración</span>
          </Link>

          <div className="admin-header-actions">
            <nav className="admin-navigation" aria-label="Navegación administrativa">
              {adminNavigation.map((item) => {
                const active = "exact" in item && item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return <Link className={active ? "is-active" : ""} aria-current={active ? "page" : undefined} href={item.href} key={item.href}>{item.label}</Link>;
              })}
            </nav>
            <Link className="admin-view-site" href="/desarrollo">Ver sitio</Link>
            <ThemeToggle />
            {clerkConfigured && (
              <div className="admin-user" aria-label="Cuenta">
                <UserButton showName />
              </div>
            )}
          </div>
          <div className="admin-mobile-navigation" ref={mobileNavigationRef}>
            <button ref={mobileTriggerRef} className="admin-mobile-menu-trigger" type="button" aria-expanded={mobileMenuOpen} aria-controls="admin-mobile-navigation-panel" aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"} onClick={() => setMobileMenuOpen((value) => !value)}>
              <span /><span /><span />
            </button>
            {mobileMenuOpen && (
              <div className="admin-mobile-navigation-panel" id="admin-mobile-navigation-panel">
                <nav aria-label="Navegación administrativa móvil">
                  {adminNavigation.map((item) => {
                    const active = "exact" in item && item.exact ? pathname === item.href : pathname.startsWith(item.href);
                    return <Link className={active ? "is-active" : ""} aria-current={active ? "page" : undefined} href={item.href} key={item.href} onClick={() => setMobileMenuOpen(false)}>{item.label}</Link>;
                  })}
                </nav>
                <Link className="admin-mobile-view-site" href="/desarrollo" onClick={() => setMobileMenuOpen(false)}>Ver sitio</Link>
                <div className="admin-mobile-theme-row"><span>Tema</span><ThemeToggle /></div>
                {clerkConfigured && <div className="admin-mobile-account-row"><span>Cuenta</span><UserButton showName /></div>}
              </div>
            )}
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
