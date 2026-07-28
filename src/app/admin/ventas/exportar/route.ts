import { desc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { sales } from "@/db/schema";
import { requireAdmin } from "@/features/auth/require-admin";

function csv(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export async function GET() {
  if (!process.env.DATABASE_URL || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
    return new Response("Configuración pendiente", { status: 503 });
  }
  await requireAdmin();
  const rows = await getDb().select().from(sales).where(eq(sales.status, "confirmed")).orderBy(desc(sales.confirmedAt));
  const header = ["Código", "Cliente", "Canal", "Total", "Costo productos", "Gastos", "Margen", "Confirmada"];
  const body = rows.map((sale) => [
    sale.code ?? sale.saleNumber, sale.customerLabel, sale.channel, sale.finalTotalCents,
    sale.productCostTotalCents, sale.expenseTotalCents, sale.profitCents, sale.confirmedAt?.toISOString() ?? "",
  ].map(csv).join(","));
  return new Response([header.map(csv).join(","), ...body].join("\r\n"), {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="ventas-housecam.csv"' },
  });
}
