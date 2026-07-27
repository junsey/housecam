import "server-only";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";

export async function requireAdmin() {
  const session = await auth();
  if (!session.userId) redirect("/sign-in");

  const [profile] = await getDb()
    .select({ id: userProfiles.id, role: userProfiles.role, clerkUserId: userProfiles.clerkUserId })
    .from(userProfiles)
    .where(eq(userProfiles.clerkUserId, session.userId))
    .limit(1);

  if (!profile || profile.role !== "admin") redirect("/");
  return profile;
}
