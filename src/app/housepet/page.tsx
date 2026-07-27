import type { Metadata } from "next";

import { PublicHeader } from "@/components/public-header";

export const metadata: Metadata = { title: "HousePet" };

export default function HousePetPage() {
  return (
    <div className="store-page">
      <PublicHeader activePath="/housepet" brand="housepet" />
      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <p className="eyebrow">Cuidado conectado</p>
              <h1>Tecnología para quienes son familia.</h1>
              <p className="lead">HousePet comparte la misma experiencia clara y cercana de HouseCam, con soluciones pensadas para acompañar el cuidado cotidiano de tus mascotas.</p>
              <div className="actions">
                <a className="button button-primary" href="mailto:hola@housecam.com?subject=Consulta%20HousePet">Hablar con nosotros</a>
                <a className="button button-secondary" href="/desarrollo">Conocer HouseCam</a>
              </div>
            </div>
            <div className="hero-visual" aria-label="HousePet en preparación">
              <div className="home-card">
                <div className="home-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M8.5 11.5c-2.8 1.7-3.4 5.7-.9 7.6 2.1 1.6 6.7 1.6 8.8 0 2.5-1.9 1.9-5.9-.9-7.6-2.1-1.3-4.9-1.3-7 0Z" /><circle cx="5" cy="8" r="2" /><circle cx="10" cy="5" r="2" /><circle cx="14" cy="5" r="2" /><circle cx="19" cy="8" r="2" /></svg>
                </div>
                <h2>HousePet</h2>
                <p>Identidad propia, la misma base confiable.</p>
                <div className="status"><span className="status-dot" /> En preparación</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
