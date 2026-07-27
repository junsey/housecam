import Image from "next/image";

import type { TeamMember } from "./about-content";
import styles from "./about.module.css";

export function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <article className={styles.memberCard}>
      <div className={styles.memberPhoto}>
        <Image
          src={member.image}
          alt={member.alt}
          fill
          sizes="(max-width: 700px) calc(100vw - 40px), 520px"
          style={{ objectPosition: member.objectPosition }}
        />
      </div>
      <div className={styles.memberContent}>
        <h3>{member.name}</h3>
        <div className={styles.memberLinks}>
          <a
            href={member.linkedIn}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`LinkedIn de ${member.name} (abre en una pestaña nueva)`}
          >
            LinkedIn ↗
          </a>
          <a href={`mailto:${member.email}`} aria-label={`Enviar un correo a ${member.name}`}>
            {member.email}
          </a>
        </div>
      </div>
    </article>
  );
}
