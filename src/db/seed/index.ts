import { eq } from "drizzle-orm";
import { pathToFileURL } from "node:url";

import { getDb } from "../runtime";
import { categories, siteSettings, storefrontContent, userProfiles } from "../schema";

export async function seed() {
  const initialAdminClerkId = process.env.INITIAL_ADMIN_CLERK_USER_ID;
  const initialAdminEmail = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  if (!initialAdminClerkId || !initialAdminEmail) {
    throw new Error("Definí INITIAL_ADMIN_CLERK_USER_ID e INITIAL_ADMIN_EMAIL antes de ejecutar el seed.");
  }

  const db = getDb();
  await db.insert(siteSettings).values({
    id: "global",
    businessName: "HouseCam",
    whatsappNumber: process.env.BUSINESS_WHATSAPP_NUMBER ?? "",
    developmentModeEnabled: true,
  }).onConflictDoNothing();

  await db.insert(storefrontContent).values([
    {
      storefront: "housecam",
      heroTitle: "Tranquilidad para tu hogar",
      heroDescription: "Soluciones de seguridad confiables y asesoramiento cercano.",
    },
    {
      storefront: "housepet",
      heroTitle: "Tecnología para quienes son familia",
      heroDescription: "Cuidado conectado para tus mascotas.",
    },
  ]).onConflictDoNothing();

  await db.insert(categories).values([
    { storefront: "housecam", name: "Cámaras", slug: "camaras", description: "Cámaras y dispositivos de videovigilancia para el hogar.", sortOrder: 10 },
    { storefront: "housecam", name: "Kits", slug: "kits", description: "Soluciones completas listas para instalar.", sortOrder: 20 },
    { storefront: "housecam", name: "Accesorios", slug: "accesorios", description: "Complementos, conectividad y almacenamiento.", sortOrder: 30 },
    { storefront: "housepet", name: "Cámaras", slug: "camaras", description: "Cámaras para acompañar y cuidar a tus mascotas.", sortOrder: 10 },
    { storefront: "housepet", name: "Alimentación", slug: "alimentacion", description: "Comederos, bebederos y soluciones de alimentación inteligente.", sortOrder: 20 },
    { storefront: "housepet", name: "Accesorios", slug: "accesorios", description: "Tecnología y accesorios para el bienestar de tus mascotas.", sortOrder: 30 },
  ]).onConflictDoNothing();

  const [existing] = await db.select({ id: userProfiles.id }).from(userProfiles)
    .where(eq(userProfiles.clerkUserId, initialAdminClerkId)).limit(1);

  if (!existing) {
    await db.insert(userProfiles).values({
      clerkUserId: initialAdminClerkId,
      role: "admin",
      fullName: process.env.INITIAL_ADMIN_NAME ?? "Administrador inicial",
      email: initialAdminEmail,
      normalizedEmail: initialAdminEmail,
    });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  seed()
    .then(() => {
      console.info("Seed inicial completado.");
      process.exit(0);
    })
    .catch((error: unknown) => {
      console.error(error);
      process.exit(1);
    });
}
