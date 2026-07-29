import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";

import { defaultSocialImage, siteUrl } from "@/lib/seo";

import "./globals.css";
import "../../public/src.css";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: "HouseCam", template: "%s | HouseCam" },
  description: "Cámaras y soluciones inteligentes para cuidar tu hogar con mayor control y tranquilidad.",
  applicationName: "HouseCam",
  authors: [{ name: "HouseCam" }],
  creator: "HouseCam",
  publisher: "HouseCam",
  category: "Tecnología para el hogar",
  keywords: ["cámaras de seguridad", "seguridad para el hogar", "cámaras Wi-Fi", "hogar inteligente", "HouseCam"],
  alternates: { canonical: "/desarrollo" },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "/desarrollo",
    siteName: "HouseCam",
    title: "HouseCam | Tu hogar, siempre cerca",
    description: "Cámaras y soluciones inteligentes para cuidar tu hogar con mayor control y tranquilidad.",
    images: [defaultSocialImage],
  },
  twitter: {
    card: "summary",
    title: "HouseCam | Tu hogar, siempre cerca",
    description: "Cámaras y soluciones inteligentes para cuidar tu hogar con mayor control y tranquilidad.",
    images: [defaultSocialImage.url],
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon-180x180.png", sizes: "180x180" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  return (
    <html lang="es" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("housecam_theme");var v=t==="light"?"light":"dark";document.documentElement.dataset.theme=v;document.documentElement.style.colorScheme=v}catch(e){}`,
          }}
        />
      </head>
      <body>
        {clerkConfigured ? (
          <ClerkProvider>
            {children}
            <Analytics />
          </ClerkProvider>
        ) : (
          <>
            {children}
            <Analytics />
          </>
        )}
      </body>
    </html>
  );
}
