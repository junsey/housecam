import type { Metadata } from "next";

import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { AboutContactCTA } from "@/features/about/about-contact-cta";
import { AboutHero } from "@/features/about/about-hero";
import styles from "@/features/about/about.module.css";
import { AboutStory } from "@/features/about/about-story";
import { MissionSection } from "@/features/about/mission-section";
import { TeamSection } from "@/features/about/team-section";
import { getWhatsappSettings } from "@/features/catalog/catalog-admin.data";
import { getWhatsappHref } from "@/lib/whatsapp";

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

export default async function AboutPage({ searchParams }: { searchParams: Promise<{ brand?: string }> }) {
  const { brand: requestedBrand } = await searchParams;
  const brand = requestedBrand === "housepet" ? "housepet" : "housecam";
  const whatsapp = await getWhatsappSettings();
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "HouseCam",
    url: siteUrl,
    logo: new URL("/android-icon-192x192.png", siteUrl).toString(),
  };

  return (
    <div className={`${styles.page} ${brand === "housepet" ? styles.housepet : ""} brand-${brand} brand-page-enter`}>
      <PublicHeader activePath="/nosotros" brand={brand} whatsappNumber={whatsapp.value} />
      <main className={styles.container}>
        <AboutHero />
        <AboutStory />
        <MissionSection />
        <TeamSection />
        <AboutContactCTA whatsappHref={getWhatsappHref(whatsapp.value, `Hola, quiero conocer más sobre las soluciones ${brand === "housepet" ? "HousePet" : "HouseCam"}.`)} />
      </main>
      <PublicFooter brand={brand} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}
