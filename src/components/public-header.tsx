"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useEffect, useRef, useState } from "react";

import { publicNavigationItems } from "@/config/public-navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { getWhatsappHref } from "@/lib/whatsapp";

type PublicHeaderProps = {
  activePath: "/desarrollo" | "/productos" | "/nosotros" | "/housepet" | "/housepet/productos";
  brand?: "housecam" | "housepet";
  showPreviewBanner?: boolean;
  whatsappNumber?: string;
};

export function PublicHeader({ activePath, brand = "housecam", showPreviewBanner = false, whatsappNumber = "" }: PublicHeaderProps) {
  const [brandMenuOpen, setBrandMenuOpen] = useState(false);
  const brandSwitcherRef = useRef<HTMLDivElement>(null);
  const brandTriggerRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHousePet = brand === "housepet";
  const whatsappHref = getWhatsappHref(whatsappNumber, `Hola, quiero recibir asesoramiento sobre ${isHousePet ? "HousePet" : "HouseCam"}.`);

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

  useEffect(() => {
    function handleOutsideClick(event: PointerEvent) {
      if (!brandSwitcherRef.current?.contains(event.target as Node)) setBrandMenuOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setBrandMenuOpen(false);
      brandTriggerRef.current?.focus();
    }
    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  function openOnHover() {
    if (!window.matchMedia("(hover: hover)").matches) return;
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setBrandMenuOpen(true);
  }

  function closeAfterHover() {
    if (!window.matchMedia("(hover: hover)").matches) return;
    closeTimerRef.current = setTimeout(() => setBrandMenuOpen(false), 140);
  }

  function handleTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowDown") return;
    event.preventDefault();
    setBrandMenuOpen(true);
    requestAnimationFrame(() => brandSwitcherRef.current?.querySelector<HTMLAnchorElement>('[role="menuitem"]')?.focus());
  }

  return (
    <>
      {showPreviewBanner && (
        <div className="preview-banner">Vista previa del sitio en desarrollo <Link href="/">Volver a la portada</Link></div>
      )}
      <header className="site-header">
        <nav className="container nav" aria-label="Navegación principal">
          <div className="brand-switcher" ref={brandSwitcherRef} onMouseEnter={openOnHover} onMouseLeave={closeAfterHover}>
            <button ref={brandTriggerRef} className="brand-switcher-trigger" type="button" aria-expanded={brandMenuOpen} aria-haspopup="menu" aria-controls="brand-switcher-menu" aria-label="Cambiar entre HouseCam y HousePet" onClick={() => setBrandMenuOpen((value) => !value)} onKeyDown={handleTriggerKeyDown}>
              <Image className="logo logo-dark-theme" src={darkLogo} alt={isHousePet ? "HousePet" : "HouseCam"} width={190} height={58} priority />
              <Image className="logo logo-light-theme" src={lightLogo} alt="" width={190} height={58} priority />
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 7 5 5 5-5" /></svg>
            </button>
            {brandMenuOpen && (
              <div className="brand-switcher-menu" id="brand-switcher-menu" role="menu" aria-label="Seleccionar marca">
                <Link className={!isHousePet ? "is-current" : ""} href="/desarrollo" role="menuitem" aria-current={!isHousePet ? "page" : undefined} onClick={() => setBrandMenuOpen(false)}>
                  <span className="brand-switcher-logo"><Image src="/housecam-black.svg" alt="HouseCam" width={150} height={45} /></span>
                  <span className="brand-switcher-claim">Tranquilidad para tu hogar</span>
                  {!isHousePet ? <span className="brand-switcher-current">Actual</span> : <span className="brand-switcher-arrow" aria-hidden="true">→</span>}
                </Link>
                <Link className={isHousePet ? "is-current" : ""} href="/housepet" role="menuitem" aria-current={isHousePet ? "page" : undefined} onClick={() => setBrandMenuOpen(false)}>
                  <span className="brand-switcher-logo"><Image src="/housepet-black.svg" alt="HousePet" width={150} height={45} /></span>
                  <span className="brand-switcher-claim">Tecnología para tus mascotas</span>
                  {isHousePet ? <span className="brand-switcher-current">Actual</span> : <span className="brand-switcher-arrow" aria-hidden="true">→</span>}
                </Link>
              </div>
            )}
          </div>
          <div className="nav-actions">
            <div className="nav-links">
              {navigation.map((item) => <Link href={item.href as Route} aria-current={activePath === item.path ? "page" : undefined} key={item.href}>{item.label}</Link>)}
              {whatsappHref ? <a className="button button-primary" href={whatsappHref} target="_blank" rel="noopener noreferrer">Hablar con nosotros</a> : <button className="button button-primary contact-disabled" type="button" disabled title="La función de contacto está temporalmente deshabilitada. Probá más tarde.">Contacto no disponible</button>}
            </div>
            <ThemeToggle />
          </div>
        </nav>
      </header>
    </>
  );
}
