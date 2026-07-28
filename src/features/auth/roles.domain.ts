export type Role = "user" | "admin";

export function canManageAdminRoles(actor: { role: Role; clerkUserId: string }, initialAdminClerkUserId: string): boolean {
  return actor.role === "admin" && actor.clerkUserId === initialAdminClerkUserId;
}

export function assertCanManageAdminRoles(actor: { role: Role; clerkUserId: string }, initialAdminClerkUserId: string) {
  if (!canManageAdminRoles(actor, initialAdminClerkUserId)) {
    throw new Error("Solo el administrador inicial puede promover o degradar administradores.");
  }
}
