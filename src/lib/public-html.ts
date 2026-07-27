import { publicContactEmail, publicNavigationItems } from "@/config/public-navigation";

const startMarker = "<!-- PUBLIC_NAV_START -->";
const endMarker = "<!-- PUBLIC_NAV_END -->";

function escapeAttribute(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export function injectPublicNavigation(html: string, activePath: string) {
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker);
  if (start === -1 || end === -1 || end < start) {
    throw new Error("La página pública no contiene los marcadores de navegación requeridos.");
  }

  const links = publicNavigationItems.map((item) => {
    const current = item.matchPath === activePath ? ' aria-current="page"' : "";
    return `<a href="${escapeAttribute(item.href)}"${current}>${item.label}</a>`;
  }).join("");
  const brandSelector = '<a href="/housepet">HousePet</a>';
  const contact = `<a class="button button-primary" href="mailto:${publicContactEmail}">Hablar con nosotros</a>`;

  return `${html.slice(0, start + startMarker.length)}${links}${brandSelector}${contact}${html.slice(end)}`;
}
