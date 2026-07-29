import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/features/auth/require-admin";
import type { Route } from "next";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false, noarchive: true },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const clerkConfigured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
  );
  if (!clerkConfigured || !process.env.DATABASE_URL) {
    redirect("/" as Route);
  }
  await requireAdmin();
  return <AdminShell clerkConfigured={clerkConfigured}>{children}</AdminShell>;
}
