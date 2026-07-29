import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  robots: { index: false, follow: false, noarchive: true },
};

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
