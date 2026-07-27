import Link from "next/link";

type StorefrontPlaceholderProps = {
  brand: "HouseCam" | "HousePet";
  eyebrow: string;
  title: string;
  description: string;
};

export function StorefrontPlaceholder({ brand, eyebrow, title, description }: StorefrontPlaceholderProps) {
  return (
    <main className="shell pb-20 pt-12">
      <section className="card grid min-h-[520px] place-items-center overflow-hidden px-6 py-16 text-center">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">{eyebrow}</p>
          <h1 className="mt-5 text-5xl font-bold leading-[0.98] tracking-[-0.04em] sm:text-7xl">{title}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">{description}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <span className="rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-bold text-white">
              Base de {brand} lista
            </span>
            <Link href="/admin" className="rounded-full border border-[var(--border)] px-5 py-3 text-sm font-bold">
              Ver área administrativa
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
