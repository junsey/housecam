import Image from "next/image";

import { teamMembers } from "./about-content";
import styles from "./about.module.css";

export function AboutHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>Quiénes somos</p>
        <h1>Tecnología para vivir con más tranquilidad</h1>
        <p className={styles.heroLead}>
          En HouseCam somos especialistas en tecnología y, entre ambos, reunimos más de veinte años de experiencia en la industria.
        </p>
      </div>
      <div className={styles.heroPortraits} aria-label="Integrantes de HouseCam">
        {teamMembers.map((member, index) => (
          <div className={index === 0 ? styles.heroPortraitPrimary : styles.heroPortraitSecondary} key={member.name}>
            <Image
              src={member.image}
              alt={member.alt}
              fill
              sizes="(max-width: 700px) 46vw, 260px"
              style={{ objectPosition: member.objectPosition }}
              priority
            />
          </div>
        ))}
      </div>
    </section>
  );
}
