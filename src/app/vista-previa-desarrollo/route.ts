import { getDevelopmentHoldingPageResponse } from "@/lib/development-holding-page";

export const dynamic = "force-dynamic";

export async function GET() {
  return getDevelopmentHoldingPageResponse();
}
