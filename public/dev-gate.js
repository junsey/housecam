// Temporary development gate.
// Replace with real authentication or remove before production.
// TODO: Remove temporary development credentials before production release.
// These frontend credentials are visible to technical users and are not real security.
const DEV_USERNAME = "admin";
const DEV_PASSWORD = "mikeyjun";
const DEV_ACCESS_KEY = "housecam_dev_access";
const DEV_ACCESS_VALUE = "granted";
const DEV_PAGE_PATH = "/desarrollo";

function hasDevAccess() {
  try {
    return sessionStorage.getItem(DEV_ACCESS_KEY) === DEV_ACCESS_VALUE;
  } catch {
    return false;
  }
}

if (document.documentElement.hasAttribute("data-dev-protected") && !hasDevAccess()) {
  window.location.replace("/");
} else {
  document.addEventListener("DOMContentLoaded", () => {
    const trigger = document.querySelector("[data-dev-access-trigger]");
    const overlay = document.querySelector("[data-dev-modal]");
    const form = document.querySelector("[data-dev-access-form]");

    if (!trigger || !overlay || !form) return;

    const closeButton = overlay.querySelector("[data-dev-modal-close]");
    const usernameInput = form.elements.username;
    const passwordInput = form.elements.password;
    const errorMessage = overlay.querySelector("[data-dev-auth-error]");
    let previouslyFocused = null;

    const focusableElements = () => [
      closeButton,
      usernameInput,
      passwordInput,
      form.querySelector('button[type="submit"]'),
    ];

    const openModal = () => {
      if (hasDevAccess()) {
        window.location.assign(DEV_PAGE_PATH);
        return;
      }

      previouslyFocused = document.activeElement;
      overlay.hidden = false;
      document.body.classList.add("modal-open");
      errorMessage.hidden = true;
      errorMessage.textContent = "";
      window.requestAnimationFrame(() => usernameInput.focus());
    };

    const closeModal = () => {
      overlay.hidden = true;
      document.body.classList.remove("modal-open");
      form.reset();
      errorMessage.hidden = true;
      errorMessage.textContent = "";
      previouslyFocused?.focus();
    };

    trigger.addEventListener("click", openModal);
    closeButton.addEventListener("click", closeModal);

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closeModal();
    });

    overlay.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = focusableElements();
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (usernameInput.value === DEV_USERNAME && passwordInput.value === DEV_PASSWORD) {
        try {
          sessionStorage.setItem(DEV_ACCESS_KEY, DEV_ACCESS_VALUE);
        } catch {
          errorMessage.textContent = "No fue posible iniciar la sesión temporal.";
          errorMessage.hidden = false;
          passwordInput.focus();
          return;
        }

        window.location.assign(DEV_PAGE_PATH);
        return;
      }

      errorMessage.textContent = "Usuario o contraseña incorrectos.";
      errorMessage.hidden = false;
      passwordInput.value = "";
      passwordInput.focus();
    });
  });
}
