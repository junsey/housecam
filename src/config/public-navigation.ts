export type PublicNavigationItem = {
  label: string;
  href: string;
  matchPath: string;
};

export const publicNavigationItems: readonly PublicNavigationItem[] = [
  { label: "Inicio", href: "/desarrollo", matchPath: "/desarrollo" },
  { label: "Tienda", href: "/productos#tienda", matchPath: "/productos" },
  { label: "Soluciones", href: "/desarrollo#beneficios", matchPath: "/soluciones" },
  { label: "Sobre nosotros", href: "/nosotros", matchPath: "/nosotros" },
] as const;

export const publicContactEmail = "hola@housecam.com";
