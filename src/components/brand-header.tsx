import Image from "next/image";
import Link from "next/link";

import { publicContactEmail, publicNavigationItems } from "@/config/public-navigation";

type BrandHeaderProps = {
  brand?: "housecam" | "housepet";
};

export function BrandHeader({ brand = "housecam" }: BrandHeaderProps) {
  const isHousePet = brand === "housepet";

  return (
    <header className="shell flex min-h-24 items-center justify-between gap-6 py-5">
      <Link href={isHousePet ? "/housepet" : "/"} aria-label={`Inicio de ${isHousePet ? "HousePet" : "HouseCam"}`}>
        <Image
          src={isHousePet ? "/housepet-black.svg" : "/housecam-black.svg"}
          alt={isHousePet ? "HousePet" : "HouseCam"}
          width={178}
          height={54}
          priority
          className="h-12 w-auto dark:invert"
        />
      </Link>
      <nav aria-label="Navegación principal" className="flex flex-wrap items-center justify-end gap-5 text-sm font-semibold">
        {publicNavigationItems.map((item) => (
          item.matchPath === "/desarrollo" ? (
            <a href={item.href} key={item.href}>{item.label}</a>
          ) : (
            <Link href={item.href as "/productos#tienda" | "/desarrollo#beneficios" | "/nosotros"} key={item.href}>{item.label}</Link>
          )
        ))}
        <Link href={isHousePet ? "/desarrollo" : "/housepet"}>{isHousePet ? "HouseCam" : "HousePet"}</Link>
        <a className="rounded-xl bg-[var(--brand)] px-4 py-2 text-white" href={`mailto:${publicContactEmail}`}>Hablar con nosotros</a>
      </nav>
    </header>
  );
}
