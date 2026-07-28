"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";

import { publicContactEmail, publicNavigationItems } from "@/config/public-navigation";

type PublicHeaderProps = {
  activePath: "/desarrollo" | "/productos" | "/nosotros" | "/housepet" | "/housepet/productos";
  brand?: "housecam" | "housepet";
  showPreviewBanner?: boolean;
};

const themeStorageKey = "housecam_theme";

export function PublicHeader({ activePath, brand = "housecam", showPreviewBanner = false }: PublicHeaderProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [brandMenuOpen, setBrandMenuOpen] = useState(false);
  const isHousePet = brand === "housepet";

  useEffect(() => {
    const stored = window.localStorage.getItem(themeStorageKey);
    const initial = stored === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = initial;
    document.documentElement.style.colorScheme = initial;
    const frame = window.requestAnimationFrame(() => setTheme(initial));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    window.localStorage.setItem(themeStorageKey, next);
  }

  const darkLogo = isHousePet ? "/housepet-white.svg" : "/housecam-white.svg";
  const lightLogo = isHousePet ? "/housepet-black.svg" : "/housecam-black.svg";
  const navigation = isHousePet ? [
    { label: "Inicio", href: "/housepet", path: "/housepet" },
    { label: "Tienda", href: "/housepet/productos#tienda", path: "/housepet/productos" },
    { label: "Sobre nosotros", href: "/nosotros?brand=housepet", path: "/nosotros" },
  ] : publicNavigationItems.map((item) => ({
    label: item.label,
    href: item.href,
    path: item.matchPath,
  }));

  return (
    <>
      {showPreviewBanner && (
        <div className="preview-banner">Vista previa del sitio en desarrollo <Link href="/">Volver a la portada</Link></div>
      )}
      <header className="site-header">
        <nav className="container nav" aria-label="Navegación principal">
          <div className="brand-switcher">
            <button className="brand-switcher-trigger" type="button" aria-expanded={brandMenuOpen} aria-label="Cambiar entre HouseCam y HousePet" onClick={() => setBrandMenuOpen((value) => !value)}>
              <Image className="logo logo-dark-theme" src={darkLogo} alt={isHousePet ? "HousePet" : "HouseCam"} width={190} height={58} priority />
              <Image className="logo logo-light-theme" src={lightLogo} alt="" width={190} height={58} priority />
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 7 5 5 5-5" /></svg>
            </button>
            {brandMenuOpen && (
              <div className="brand-switcher-menu">
                <Link className={!isHousePet ? "is-current" : ""} href="/desarrollo" onClick={() => setBrandMenuOpen(false)}>
                  <Image src="/housecam-black.svg" alt="HouseCam" width={150} height={45} />
                  <span>Seguridad para tu hogar</span>
                </Link>
                <Link className={isHousePet ? "is-current" : ""} href="/housepet" onClick={() => setBrandMenuOpen(false)}>
                  <Image src="/housepet-black.svg" alt="HousePet" width={150} height={45} />
                  <span>Tecnología para tus mascotas</span>
                </Link>
              </div>
            )}
          </div>
          <div className="nav-actions">
            <div className="nav-links">
              {navigation.map((item) => <Link href={item.href as Route} aria-current={activePath === item.path ? "page" : undefined} key={item.href}>{item.label}</Link>)}
              <a className="button button-primary" href={`mailto:${publicContactEmail}`}>Hablar con nosotros</a>
            </div>
            <button
              className="theme-toggle"
              type="button"
              role="switch"
              aria-checked={theme === "light"}
              aria-label={theme === "dark" ? "Activar tema claro" : "Activar tema oscuro"}
              title={theme === "dark" ? "Activar tema claro" : "Activar tema oscuro"}
              onClick={toggleTheme}
            >
              <svg className="theme-icon theme-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M20.2 15.6A8.5 8.5 0 0 1 8.4 3.8 8.5 8.5 0 1 0 20.2 15.6Z" /></svg>
              <svg className="theme-icon theme-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" /></svg>
            </button>
          </div>
        </nav>
      </header>
    </>
  );
}
