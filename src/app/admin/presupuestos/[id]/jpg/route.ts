import { requireAdmin } from "@/features/auth/require-admin";
import { buildQuoteJpg } from "@/features/quotes/quote-jpg";
import { getQuote } from "@/features/quotes/quotes-admin.data";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const data = await getQuote(id);
  if (!data) return new Response("Presupuesto no encontrado", { status: 404 });
  const bytes = await buildQuoteJpg(data);
  const filename = `${data.quote.code ?? "presupuesto"}.jpg`;
  return new Response(bytes, {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
