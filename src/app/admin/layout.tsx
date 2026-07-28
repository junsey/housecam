import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/features/auth/require-admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  if (clerkConfigured && process.env.CLERK_SECRET_KEY && process.env.DATABASE_URL) {
    await requireAdmin();
  }
  return <AdminShell clerkConfigured={clerkConfigured}>{children}</AdminShell>;
}
