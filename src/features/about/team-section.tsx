import { teamMembers } from "./about-content";
import styles from "./about.module.css";
import { TeamMemberCard } from "./team-member-card";

export function TeamSection() {
  return (
    <section className={styles.team} aria-labelledby="team-title">
      <div className={styles.sectionIntro}>
        <p className={styles.sectionKicker}>Las personas</p>
        <h2 id="team-title">El equipo detrás de HouseCam</h2>
        <p>
          HouseCam nace de la combinación de experiencia tecnológica, atención cercana y una convicción compartida: la seguridad debe simplificar la vida, no volverla más complicada.
        </p>
      </div>
      <div className={styles.teamGrid}>
        {teamMembers.map((member) => <TeamMemberCard member={member} key={member.name} />)}
      </div>
    </section>
  );
}
