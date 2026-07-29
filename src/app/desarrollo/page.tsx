import type { Metadata } from "next";
import Link from "next/link";

import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { HouseCamAppSection } from "@/components/housecam-app-section";
import { RecommendedProductsCarousel } from "@/components/recommended-products-carousel";
import { getDevelopmentMode, getHomeAppSectionEnabled, getWhatsappSettings } from "@/features/catalog/catalog-admin.data";
import { getStoreProducts } from "@/features/catalog/catalog-store.data";
import { getWhatsappHref } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Tu hogar, siempre cerca",
  alternates: { canonical: "/desarrollo" },
  description: "HouseCam: seguridad simple para todos los días.",
};
export const dynamic = "force-dynamic";

export default async function DevelopmentPage() {
  const [whatsapp, catalog, developmentModeEnabled, homeAppSectionEnabled] = await Promise.all([getWhatsappSettings(), getStoreProducts("housecam"), getDevelopmentMode(), getHomeAppSectionEnabled()]);
  const whatsappHref = getWhatsappHref(whatsapp.value, "Hola, quiero recibir asesoramiento sobre las soluciones HouseCam.");
  return (
    <div className="brand-housecam brand-page-enter">
      <PublicHeader activePath="/desarrollo" showPreviewBanner={developmentModeEnabled} whatsappNumber={whatsapp.value} />
      <main id="inicio">
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <p className="eyebrow">Tecnología confiable para tu hogar</p>
              <h1>Tu hogar, siempre cerca.</h1>
              <p className="lead">Cámaras y soluciones inteligentes para cuidar lo que más te importa con mayor control y tranquilidad.</p>
              <div className="actions">
                <Link className="button button-primary" href="/productos#tienda">Explorar soluciones</Link>
                {whatsappHref ? <a className="button button-secondary" href={whatsappHref} target="_blank" rel="noopener noreferrer">Hablar con un asesor</a> : <button className="button button-secondary contact-disabled" type="button" disabled title="La función de contacto está temporalmente deshabilitada. Probá más tarde.">Contacto no disponible. Probá más tarde.</button>}
              </div>
              <ul className="trust-list"><li>Instalación simple</li><li>Asesoramiento personalizado</li><li>Control desde tu celular</li></ul>
            </div>
            <div className="hero-visual" aria-label="Representación de un sistema conectado">
              <div className="home-card">
                <div className="home-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></svg>
                </div>
                <h2>Todo en orden</h2>
                <p>Accedé a tus cámaras y dispositivos en tiempo real desde cualquier lugar.</p>
                <div className="status"><span className="status-dot" />Conexión activa</div>
              </div>
            </div>
          </div>
        </section>
        <RecommendedProductsCarousel products={catalog.items.slice(0, 10)} />
        {homeAppSectionEnabled && <HouseCamAppSection />}
      </main>
      <PublicFooter />
    </div>
  );
}
