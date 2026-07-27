"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { publicContactEmail, publicNavigationItems } from "@/config/public-navigation";

type PublicHeaderProps = {
  activePath: "/desarrollo" | "/productos" | "/nosotros" | "/housepet";
  brand?: "housecam" | "housepet";
  showPreviewBanner?: boolean;
};

const themeStorageKey = "housecam_theme";

export function PublicHeader({ activePath, brand = "housecam", showPreviewBanner = false }: PublicHeaderProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
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

  const logo = isHousePet
    ? (theme === "dark" ? "/housepet-white.svg" : "/housepet-black.svg")
    : (theme === "dark" ? "/housecam-white.svg" : "/housecam-black.svg");

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/src.css" />
      {showPreviewBanner && (
        <div className="preview-banner">Vista previa del sitio en desarrollo <Link href="/">Volver a la portada</Link></div>
      )}
      <header className="site-header">
        <nav className="container nav" aria-label="Navegación principal">
          <Link href={isHousePet ? "/housepet" : "/desarrollo"} aria-label={`${isHousePet ? "HousePet" : "HouseCam"}, inicio`}>
            <Image className="logo" src={logo} alt={isHousePet ? "HousePet" : "HouseCam"} width={190} height={58} priority />
          </Link>
          <div className="nav-actions">
            <div className="nav-links">
              {publicNavigationItems.map((item) => (
                item.matchPath === "/desarrollo" ? (
                  <Link href="/desarrollo" aria-current={activePath === "/desarrollo" ? "page" : undefined} key={item.href}>{item.label}</Link>
                ) : item.matchPath === "/productos" ? (
                  <Link href="/productos#tienda" aria-current={activePath === "/productos" ? "page" : undefined} key={item.href}>{item.label}</Link>
                ) : item.matchPath === "/nosotros" ? (
                  <Link href="/nosotros" aria-current={activePath === "/nosotros" ? "page" : undefined} key={item.href}>{item.label}</Link>
                ) : (
                  <Link href="/desarrollo#beneficios" key={item.href}>{item.label}</Link>
                )
              ))}
              <Link href={isHousePet ? "/desarrollo" : "/housepet"} aria-current={activePath === "/housepet" ? "page" : undefined}>
                {isHousePet ? "HouseCam" : "HousePet"}
              </Link>
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
