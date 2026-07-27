import Image from "next/image";
import Link from "next/link";

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
      <nav aria-label="Navegación principal" className="flex items-center gap-5 text-sm font-semibold">
        {!isHousePet && <Link href="/productos">Tienda</Link>}
        <Link href={isHousePet ? "/" : "/housepet"}>{isHousePet ? "HouseCam" : "HousePet"}</Link>
        <Link href="/admin" className="rounded-full border border-[var(--border)] px-4 py-2">
          Administración
        </Link>
      </nav>
    </header>
  );
}
