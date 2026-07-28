import { migrate } from "drizzle-orm/neon-serverless/migrator";

import { getDb } from "./runtime";
import { seed } from "./seed";

async function deployDatabase() {
  if (!process.env.DATABASE_URL) {
    console.info("DATABASE_URL ausente: se omiten migraciones durante este build.");
    return;
  }

  console.info("Aplicando migraciones de base de datos...");
  await migrate(getDb(), { migrationsFolder: "./drizzle" });

  if (process.env.INITIAL_ADMIN_CLERK_USER_ID && process.env.INITIAL_ADMIN_EMAIL) {
    console.info("Aplicando seed idempotente...");
    await seed();
  } else {
    console.info("Administrador inicial no configurado: se omite el seed.");
  }
}

deployDatabase().catch((error: unknown) => {
  console.error("Falló la preparación de la base de datos.", error);
  process.exit(1);
});
