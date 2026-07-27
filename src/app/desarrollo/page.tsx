import type { Metadata } from "next";

import { PublicHeader } from "@/components/public-header";

export const metadata: Metadata = {
  title: "Sitio en desarrollo",
  description: "HouseCam: seguridad simple para todos los días.",
};

export default function DevelopmentPage() {
  return (
    <>
      <PublicHeader activePath="/desarrollo" showPreviewBanner />
      <main id="inicio">
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <p className="eyebrow">Seguridad simple para todos los días</p>
              <h1>Tu hogar, siempre cerca.</h1>
              <p className="lead">Cámaras y soluciones inteligentes para que puedas saber que todo está bien, estés donde estés.</p>
              <div className="actions">
                <a className="button button-primary" href="#beneficios">Encontrar mi solución</a>
                <a className="button button-secondary" href="mailto:hola@housecam.com">Hablar con un asesor</a>
              </div>
              <ul className="trust-list"><li>Instalación sencilla</li><li>Asistencia local</li><li>Acceso desde tu celular</li></ul>
            </div>
            <div className="hero-visual" aria-label="Representación de un hogar protegido">
              <div className="home-card">
                <div className="home-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></svg>
                </div>
                <h2>Todo está bien en casa</h2>
                <p>Conectado y a tu alcance, estés donde estés.</p>
                <div className="status"><span className="status-dot" />Hogar protegido</div>
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
    </>
  );
}
