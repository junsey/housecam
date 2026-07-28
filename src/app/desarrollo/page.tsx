import type { Metadata } from "next";

import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { getWhatsappSettings } from "@/features/catalog/catalog-admin.data";
import { getWhatsappHref } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Sitio en desarrollo",
  description: "HouseCam: seguridad simple para todos los días.",
};

export default async function DevelopmentPage() {
  const whatsapp = await getWhatsappSettings();
  const whatsappHref = getWhatsappHref(whatsapp.value, "Hola, quiero recibir asesoramiento sobre las soluciones HouseCam.");
  return (
    <div className="brand-housecam brand-page-enter">
      <PublicHeader activePath="/desarrollo" showPreviewBanner whatsappNumber={whatsapp.value} />
      <main id="inicio">
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <p className="eyebrow">Tecnología confiable para tu hogar</p>
              <h1>Tu hogar, siempre cerca.</h1>
              <p className="lead">Cámaras y soluciones inteligentes para cuidar lo que más te importa con mayor control y tranquilidad.</p>
              <div className="actions">
                <a className="button button-primary" href="#beneficios">Explorar soluciones</a>
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
        <section className="features" id="beneficios">
          <div className="container">
            <div className="section-heading"><h2>Tranquilidad, sin complicaciones.</h2><p>La tecnología se ocupa del resto para que vos puedas concentrarte en lo importante.</p></div>
            <div className="cards">
              <article className="card"><span className="card-number">01</span><h3>Mirá tu hogar</h3><p>Accedé desde cualquier lugar con una experiencia clara y fácil de usar.</p></article>
              <article className="card"><span className="card-number">02</span><h3>Recibí alertas útiles</h3><p>Enterate cuando realmente importa, sin mensajes que te abrumen.</p></article>
              <article className="card"><span className="card-number">03</span><h3>Contá con ayuda</h3><p>Te acompañamos antes, durante y después de elegir tu solución.</p></article>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
