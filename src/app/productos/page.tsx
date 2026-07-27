import type { Metadata } from "next";

import { PublicHeader } from "@/components/public-header";

export const metadata: Metadata = {
  title: "Tienda",
  description: "Tienda HouseCam: soluciones inteligentes para cuidar tu hogar.",
};

export default function ProductsPage() {
  return (
    <div className="store-page">
      <PublicHeader activePath="/productos" />
      <main>
        <section className="hero" id="catalogo">
          <div className="container hero-grid">
            <div>
              <p className="eyebrow">Estamos preparando el catálogo</p>
              <h1>Seguridad simple, lista para elegir.</h1>
              <p className="lead">Muy pronto vas a poder explorar cámaras, kits y soluciones HouseCam con información clara para encontrar la opción indicada para tu hogar.</p>
              <div className="actions">
                <a className="button button-primary" href="#tienda">Explorar la tienda</a>
                <a className="button button-secondary" href="/desarrollo">Conocer HouseCam</a>
              </div>
              <ul className="trust-list"><li>Asesoramiento local</li><li>Precios claros</li><li>Soluciones confiables</li></ul>
            </div>
            <div className="hero-visual" aria-label="Estado de la tienda HouseCam">
              <div className="home-card">
                <div className="home-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 6h2l2 10h10l2-7H6" /><circle cx="9" cy="20" r="1" /><circle cx="17" cy="20" r="1" /></svg>
                </div>
                <h2>Catálogo HouseCam</h2>
                <p>La estructura de productos, kits, precios y stock ya está preparada.</p>
                <div className="status"><span className="status-dot" /> Próximamente disponible</div>
              </div>
            </div>
          </div>
        </section>
        <section className="features" id="tienda" aria-labelledby="store-title">
          <div className="container">
            <div className="section-heading">
              <h2 id="store-title">Explorá la nueva tienda HouseCam</h2>
              <p>Los productos reales se incorporan desde el catálogo administrativo.</p>
            </div>
            <div className="cards">
              <article className="card"><span className="card-number">01</span><h3>Cámaras</h3><p>Opciones para interior y exterior con especificaciones simples.</p><a className="store-card-link" href="mailto:hola@housecam.com?subject=Consulta%20por%20cámaras">Consultar disponibilidad →</a></article>
              <article className="card"><span className="card-number">02</span><h3>Kits HouseCam</h3><p>Soluciones completas calculadas desde sus componentes reales.</p><a className="store-card-link" href="mailto:hola@housecam.com?subject=Consulta%20por%20kits">Consultar disponibilidad →</a></article>
              <article className="card"><span className="card-number">03</span><h3>Accesorios</h3><p>Complementos para adaptar cada instalación a tu hogar.</p><a className="store-card-link" href="mailto:hola@housecam.com?subject=Consulta%20por%20accesorios">Consultar disponibilidad →</a></article>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
