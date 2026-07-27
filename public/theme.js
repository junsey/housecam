const THEME_STORAGE_KEY = "housecam_theme";
const root = document.documentElement;

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function applyTheme(theme) {
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#071019" : "#f7f9fa");

  document.querySelectorAll("[data-theme-logo]").forEach((logo) => {
    logo.src = theme === "dark" ? "/housecam-white.svg" : "/housecam-black.svg";
  });

  document.querySelectorAll("[data-theme-toggle]").forEach((toggle) => {
    const isDark = theme === "dark";
    toggle.setAttribute("aria-checked", String(!isDark));
    toggle.setAttribute("aria-label", isDark ? "Activar tema claro" : "Activar tema oscuro");
    toggle.setAttribute("title", isDark ? "Activar tema claro" : "Activar tema oscuro");
  });
}

applyTheme(getStoredTheme() === "light" ? "light" : "dark");

document.addEventListener("DOMContentLoaded", () => {
  applyTheme(root.dataset.theme);

  document.querySelectorAll("[data-theme-toggle]").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);

      try {
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      } catch {
        // The selected theme still applies for the current page view.
      }
    });
  });
});
