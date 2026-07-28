import styles from "./about.module.css";

export function AboutStory() {
  return (
    <section className={styles.story} aria-labelledby="about-story-title">
      <div>
        <p className={styles.sectionKicker}>Sobre nosotros</p>
        <h2 id="about-story-title">Un hogar seguro también debe darte tranquilidad</h2>
        <p className={styles.storyHighlight}>
          La tecnología debe ayudarte a vivir con más calma, no darte nuevas preocupaciones.
        </p>
      </div>
      <div className={styles.storyBody}>
        <p>
          En HouseCam entendemos el valor de tu hogar y de todo lo que construiste dentro de él. Por eso acercamos soluciones tecnológicas simples, confiables y pensadas para acompañarte todos los días.
        </p>
        <p>
          Queremos que puedas sentirte tranquilo tanto cuando estás en casa como cuando salís, sabiendo que contás con herramientas para cuidar lo que más te importa.
        </p>
      </div>
    </section>
  );
}
