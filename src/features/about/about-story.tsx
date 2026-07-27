import styles from "./about.module.css";

export function AboutStory() {
  return (
    <section className={styles.story} aria-labelledby="about-story-title">
      <div>
        <p className={styles.sectionKicker}>Sobre nosotros</p>
        <h2 id="about-story-title">Un hogar seguro también debe darte tranquilidad</h2>
        <p className={styles.storyHighlight}>
          Tu casa guarda mucho más que objetos: guarda recuerdos, rutinas y todo aquello que construiste con esfuerzo.
        </p>
      </div>
      <div className={styles.storyBody}>
        <p>
          Sabemos que tu casa es mucho más que un espacio. Es el lugar donde construís tus recuerdos, desarrollás tu vida cotidiana y protegés todo aquello que conseguiste con esfuerzo.
        </p>
        <p>
          Por eso ponemos a tu alcance herramientas tecnológicas pensadas para que tu hogar no solo sea un lugar seguro, sino también un espacio que te dé tranquilidad.
        </p>
      </div>
    </section>
  );
}
