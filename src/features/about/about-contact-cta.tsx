import Link from "next/link";

import styles from "./about.module.css";

export function AboutContactCTA({ whatsappHref }: { whatsappHref: string | null }) {
  return (
    <section className={styles.contact} aria-labelledby="contact-title">
      <div>
        <h2 id="contact-title">Estamos para ayudarte a cuidar lo que más te importa</h2>
        <p>Contanos qué necesitás y te ayudaremos a encontrar una solución adecuada para tu hogar.</p>
      </div>
      <div className={styles.contactActions}>
        {whatsappHref ? (
          <a className={styles.primaryButton} href={whatsappHref} target="_blank" rel="noopener noreferrer">
            Hablar con nosotros
          </a>
        ) : (
          <a className={styles.primaryButton} href="mailto:hola@housecam.com">Hablar con nosotros</a>
        )}
        <Link className={styles.secondaryButton} href="/productos#tienda">Conocer nuestros productos</Link>
      </div>
    </section>
  );
}
