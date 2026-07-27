"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { publicContactEmail, publicNavigationItems } from "@/config/public-navigation";

import styles from "./about.module.css";

const themeStorageKey = "housecam_theme";

export function AboutHeader() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(themeStorageKey);
    const initialTheme = storedTheme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = initialTheme;
    document.documentElement.style.colorScheme = initialTheme;
    const frame = window.requestAnimationFrame(() => setTheme(initialTheme));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    window.localStorage.setItem(themeStorageKey, nextTheme);
  }

  return (
    <header className={styles.header}>
      <nav className={styles.headerInner} aria-label="Navegación principal">
        <a className={styles.logoLink} href="/desarrollo" aria-label="HouseCam, inicio">
          <Image className={styles.logoDark} src="/housecam-white.svg" alt="HouseCam" width={190} height={58} priority />
          <Image className={styles.logoLight} src="/housecam-black.svg" alt="HouseCam" width={190} height={58} priority />
        </a>
        <div className={styles.navActions}>
          <div className={styles.navLinks}>
            {publicNavigationItems.map((item) => (
              item.matchPath === "/desarrollo" ? (
                <a href={item.href} key={item.href}>{item.label}</a>
              ) : (
                <Link
                  href={item.href as "/productos#tienda" | "/desarrollo#beneficios" | "/nosotros"}
                  aria-current={item.matchPath === "/nosotros" ? "page" : undefined}
                  key={item.href}
                >
                  {item.label}
                </Link>
              )
            ))}
            <Link href="/housepet">HousePet</Link>
            <a className={styles.navCta} href={`mailto:${publicContactEmail}`}>Hablar con nosotros</a>
          </div>
          <button
            className={styles.themeToggle}
            type="button"
            role="switch"
            aria-checked={theme === "light"}
            aria-label={theme === "dark" ? "Activar tema claro" : "Activar tema oscuro"}
            title={theme === "dark" ? "Activar tema claro" : "Activar tema oscuro"}
            onClick={toggleTheme}
          >
            <svg className={styles.themeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M20.2 15.6A8.5 8.5 0 0 1 8.4 3.8 8.5 8.5 0 1 0 20.2 15.6Z" />
            </svg>
            <svg className={styles.themeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="12" cy="12" r="3.5" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
}
