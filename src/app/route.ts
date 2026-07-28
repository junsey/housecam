import { readFile } from "node:fs/promises";
import path from "node:path";

import { getDevelopmentMode } from "@/features/catalog/catalog-admin.data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const developmentModeEnabled = await getDevelopmentMode();
  if (!developmentModeEnabled) {
    return Response.redirect(new URL("/desarrollo", request.url), 307);
  }
  const html = await readFile(path.join(process.cwd(), "public", "index.html"), "utf8");

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
