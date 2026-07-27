import type { Metadata } from "next";
import Link from "next/link";

import { PublicHeader } from "@/components/public-header";
import { AboutContactCTA } from "@/features/about/about-contact-cta";
import { AboutHero } from "@/features/about/about-hero";
import styles from "@/features/about/about.module.css";
import { AboutStory } from "@/features/about/about-story";
import { MissionSection } from "@/features/about/mission-section";
import { TeamSection } from "@/features/about/team-section";
import { getWhatsappSettings } from "@/features/catalog/catalog-admin.data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.housecam.ar";
const socialImage = new URL("/android-icon-192x192.png", siteUrl).toString();

export const metadata: Metadata = {
  title: "Sobre nosotros",
  description: "Conocé al equipo de HouseCam y nuestra misión de acercarte tecnología para proteger tu hogar y vivir con mayor tranquilidad.",
  alternates: { canonical: new URL("/nosotros", siteUrl).toString() },
  openGraph: {
    title: "Sobre nosotros | HouseCam",
    description: "Conocé al equipo de HouseCam y nuestra misión de acercarte tecnología para proteger tu hogar y vivir con mayor tranquilidad.",
    url: new URL("/nosotros", siteUrl).toString(),
    siteName: "HouseCam",
    type: "website",
    locale: "es_AR",
    images: [{ url: socialImage, width: 192, height: 192, alt: "HouseCam" }],
  },
};

function getWhatsappHref(value: string) {
  const number = value.replace(/\D/g, "");
  if (!number) return null;
  const message = encodeURIComponent("Hola, quiero conocer más sobre las soluciones HouseCam para mi hogar.");
  return `https://wa.me/${number}?text=${message}`;
}

export default async function AboutPage() {
  const whatsapp = await getWhatsappSettings();
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "HouseCam",
    url: siteUrl,
    logo: new URL("/android-icon-192x192.png", siteUrl).toString(),
  };

  return (
    <div className={styles.page}>
      <PublicHeader activePath="/nosotros" />
      <main className={styles.container}>
        <AboutHero />
        <AboutStory />
        <MissionSection />
        <TeamSection />
        <AboutContactCTA whatsappHref={getWhatsappHref(whatsapp.value)} />
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>© HouseCam. Tecnología para vivir con más tranquilidad.</span>
          <nav aria-label="Navegación del pie">
            <Link href="/productos#tienda">Productos</Link>
            <Link href="/nosotros">Sobre nosotros</Link>
          </nav>
        </div>
      </footer>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}
