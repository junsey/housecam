import { getQuote } from "@/features/quotes/quotes-admin.data";
import { buildQuotePdf } from "@/features/quotes/quote-pdf";
import { requireAdmin } from "@/features/auth/require-admin";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const data = await getQuote(id);
  if (!data) return new Response("Presupuesto no encontrado", { status: 404 });
  const bytes = await buildQuotePdf(data);
  const filename = `${data.quote.code ?? "presupuesto"}.pdf`;
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
