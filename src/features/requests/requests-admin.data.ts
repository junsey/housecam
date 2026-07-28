import "server-only";

import { asc, desc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { purchaseRequestItems, purchaseRequests } from "@/db/schema";

export async function getPurchaseRequests() {
  if (!process.env.DATABASE_URL) return { configured: false as const, requests: [] };
  const requests = await getDb().select().from(purchaseRequests).orderBy(desc(purchaseRequests.createdAt)).limit(250);
  return { configured: true as const, requests };
}

export async function getPurchaseRequest(id: string) {
  if (!process.env.DATABASE_URL) return null;
  const [request] = await getDb().select().from(purchaseRequests).where(eq(purchaseRequests.id, id)).limit(1);
  if (!request) return null;
  const items = await getDb().select().from(purchaseRequestItems)
    .where(eq(purchaseRequestItems.purchaseRequestId, id))
    .orderBy(asc(purchaseRequestItems.productNameSnapshot));
  return { request, items };
}
