import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear cuenta",
  robots: { index: false, follow: false, noarchive: true },
};

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
