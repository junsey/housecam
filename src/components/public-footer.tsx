import Link from "next/link";
import type { Route } from "next";

export function PublicFooter({ brand = "housecam" }: { brand?: "housecam" | "housepet" }) {
  const isPet = brand === "housepet";
  return (
    <footer className="public-footer">
      <div className="container public-footer-inner">
        <span>© {isPet ? "HousePet" : "HouseCam"}. Tecnología cercana para cuidar lo que importa.</span>
        <nav aria-label="Navegación del pie">
          <Link href={(isPet ? "/housepet/productos" : "/productos") as Route}>Tienda</Link>
          <Link href={(isPet ? "/nosotros?brand=housepet" : "/nosotros") as Route}>Sobre nosotros</Link>
          <Link className="footer-admin-link" href="/admin">Administración</Link>
        </nav>
      </div>
    </footer>
  );
}
