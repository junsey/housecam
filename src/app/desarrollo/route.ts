import { readFile } from "node:fs/promises";
import path from "node:path";

import { injectPublicNavigation } from "@/lib/public-html";

export const dynamic = "force-static";

export async function GET() {
  const source = await readFile(path.join(process.cwd(), "public", "desarrollo.html"), "utf8");
  const html = injectPublicNavigation(source, "/desarrollo");

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
