import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";

import { QuoteForm } from "@/components/quote-form";
import { getQuoteFormData } from "@/features/quotes/quotes-admin.data";

export const metadata: Metadata = { title: "Nuevo presupuesto" };

export default async function NewQuotePage() {
  const { products } = await getQuoteFormData();
  return <main className="shell py-10">
    <Link className="admin-back-link" href={"/admin/presupuestos" as Route}>← Presupuestos</Link>
    <div className="my-7"><p className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">Ventas</p><h1 className="mt-2 text-4xl font-bold">Nuevo presupuesto</h1></div>
    <QuoteForm products={products} />
  </main>;
}
