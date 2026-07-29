import Image from "next/image";

const benefits = [
  "Todos tus dispositivos, en un solo lugar",
  "Visualización en tiempo real",
  "Alertas importantes en tu celular",
  "Soporte prioritario desde la app",
];

type HouseCamAppSectionProps = {
  qrUrl?: string | null;
  appStoreUrl?: string;
  googlePlayUrl?: string;
};

export function HouseCamAppSection({ qrUrl = null, appStoreUrl = "", googlePlayUrl = "" }: HouseCamAppSectionProps) {
  const appStoreHref = appStoreUrl || "/";
  const googlePlayHref = googlePlayUrl || "/";

  return <section className="housecam-app-section" aria-labelledby="housecam-app-title">
    <div className="container housecam-app-grid">
      <div className="housecam-app-copy">
        <p className="eyebrow">📱 Aplicación oficial HouseCam</p>
        <h2 id="housecam-app-title">Salí tranquilo.<br />HouseCam se queda cuidando.</h2>
        <p className="housecam-app-lead">Controlá tus cámaras, recibí alertas y verificá que todo esté bien desde cualquier lugar. Todo desde una única aplicación diseñada para darte tranquilidad.</p>
        <ul className="housecam-app-benefits">{benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul>
        <a className="button button-primary" href="#housecam-app-demo">Ver cómo funciona</a>

        <div className="housecam-app-download" id="descargar-housecam">
          <div className="housecam-app-download-copy">
            <h3>Descargá HouseCam</h3>
            <p>Disponible para Android e iPhone.</p>
          </div>
          <div className="housecam-app-download-options">
            {qrUrl
              ? <div className="housecam-qr-image"><Image src={qrUrl} alt="Código QR para descargar HouseCam" fill sizes="104px" /></div>
              : <div className="housecam-qr-placeholder" role="img" aria-label="Código QR de descarga próximamente disponible"><span>HC</span></div>}
            <div className="housecam-store-badges" aria-label="Descargas de HouseCam">
              <a href={appStoreHref} target={appStoreUrl ? "_blank" : undefined} rel={appStoreUrl ? "noopener noreferrer" : undefined} aria-label="Abrir HouseCam en App Store"><Image src="/app-store-badge.png" alt="Consíguelo en el App Store" width={150} height={45} /></a>
              <a href={googlePlayHref} target={googlePlayUrl ? "_blank" : undefined} rel={googlePlayUrl ? "noopener noreferrer" : undefined} aria-label="Abrir HouseCam en Google Play"><Image src="/google-play-badge.png" alt="Disponible en Google Play" width={150} height={45} /></a>
            </div>
          </div>
        </div>
      </div>

      <div className="housecam-app-visual" id="housecam-app-demo">
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
      </div>
    </div>
  </section>;
}
