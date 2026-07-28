import styles from "./about.module.css";

export function MissionSection() {
  return (
    <section className={styles.mission} aria-labelledby="mission-title">
      <p className={styles.sectionKicker}>Nuestra misión</p>
      <h2 id="mission-title">
        Nuestra misión es ayudarte a reducir las preocupaciones, tanto cuando estás en casa como cuando salís, para que puedas concentrarte en lo verdaderamente importante de la vida: <strong>vivirla.</strong>
      </h2>
    </section>
  );
}
