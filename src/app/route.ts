import { getDevelopmentMode } from "@/features/catalog/catalog-admin.data";
import { getDevelopmentHoldingPageResponse } from "@/lib/development-holding-page";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const developmentModeEnabled = await getDevelopmentMode();
  if (!developmentModeEnabled) {
    return Response.redirect(new URL("/desarrollo", request.url), 307);
  }
  return getDevelopmentHoldingPageResponse();
}
