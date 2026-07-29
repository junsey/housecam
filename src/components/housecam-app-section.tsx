import Image from "next/image";

const benefits = [
  "Todos tus dispositivos, en un solo lugar",
  "Visualización en tiempo real",
  "Alertas importantes en tu celular",
  "Soporte prioritario desde la app",
];

export function HouseCamAppSection() {
  return <section className="housecam-app-section" aria-labelledby="housecam-app-title">
    <div className="container housecam-app-grid">
      <div className="housecam-app-copy">
        <p className="eyebrow">📱 Aplicación oficial HouseCam</p>
        <h2 id="housecam-app-title">Salí tranquilo.<br />HouseCam se queda cuidando.</h2>
        <p className="housecam-app-lead">Controlá tus cámaras, recibí alertas y verificá que todo esté bien desde cualquier lugar. Todo desde una única aplicación diseñada para darte tranquilidad.</p>
        <ul className="housecam-app-benefits">{benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul>
        <a className="button button-primary" href="#descargar-housecam" aria-label="Ir a las opciones de descarga de la aplicación HouseCam">Descargar aplicación</a>
      </div>

      <div className="housecam-app-visual">
        <div className="housecam-app-orbit" aria-hidden="true" />
        <div className="housecam-phone" role="img" aria-label="Vista conceptual de la aplicación móvil HouseCam">
          <div className="housecam-phone-speaker" aria-hidden="true" />
          <div className="housecam-phone-screen">
            <header><span>HouseCam</span><span className="housecam-phone-avatar">RS</span></header>
            <p className="housecam-phone-kicker">⌂ Hogar</p>
            <section className="housecam-phone-status"><small>Estado general</small><strong>Todo protegido</strong><span><i /> Conexión activa</span></section>
            <div className="housecam-phone-heading"><strong>Dispositivos</strong><small>3 activos</small></div>
            <ul className="housecam-device-list">
              <li><span className="housecam-device-icon">◉</span><span><strong>Cámara exterior</strong><small>Conectada</small></span><i /></li>
              <li><span className="housecam-device-icon">◉</span><span><strong>Cámara interior</strong><small>Grabando</small></span><i /></li>
              <li><span className="housecam-device-icon">⌂</span><span><strong>Entrada principal</strong><small>Sin movimientos</small></span><i /></li>
            </ul>
            <div className="housecam-phone-activity"><span><small>Última actividad</small><strong>Hace 14 segundos</strong></span><span className="housecam-phone-pulse" /></div>
            <button type="button" tabIndex={-1}>Ver cámaras</button>
          </div>
        </div>

        <div className="housecam-app-download" id="descargar-housecam">
          <h3>Descargá HouseCam</h3>
          {/* TODO: reemplazar por QR definitivo antes de producción. */}
          <div className="housecam-qr-placeholder" role="img" aria-label="Código QR de descarga próximamente disponible"><span>HC</span></div>
          <p>Disponible para</p>
          <div className="housecam-store-badges" aria-label="Plataformas próximamente disponibles">
            <span aria-label="Próximamente disponible en App Store"><Image src="/app-store-badge.png" alt="Consíguelo en el App Store" width={150} height={45} /></span>
            <span aria-label="Próximamente disponible en Google Play"><Image src="/google-play-badge.png" alt="Disponible en Google Play" width={150} height={45} /></span>
          </div>
        </div>
      </div>
    </div>
  </section>;
}
