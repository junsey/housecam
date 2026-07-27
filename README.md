# HouseCam Platform

Base unificada para las tiendas HouseCam y HousePet y su operación interna. La Fase 1 establece Next.js App Router, TypeScript estricto, Tailwind CSS, Clerk, Neon PostgreSQL, Drizzle ORM, Zod, Zustand, Vercel Blob y Analytics.

## Requisitos

- Node.js 20.9 o posterior.
- Una base PostgreSQL en Neon.
- Una aplicación de Clerk.
- Un Blob Store de Vercel cuando se habilite la carga de imágenes.

## Desarrollo local

1. Instalá dependencias:

   ```bash
   npm install
   ```

2. Copiá `.env.example` a `.env.local` y completá las variables.

3. Aplicá la migración y cargá los datos base:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. Iniciá el entorno:

   ```bash
   npm run dev
   ```

Rutas iniciales:

- `/`: HouseCam.
- `/housepet`: HousePet.
- `/admin`: base administrativa protegida por Clerk.

## Administrador inicial

El seed crea el único administrador inicial a partir de `INITIAL_ADMIN_CLERK_USER_ID` e `INITIAL_ADMIN_EMAIL`. La regla de dominio reserva a esa identidad la promoción y degradación de otros administradores. Toda futura mutación de roles deberá registrar auditoría.

## Base de datos

- Esquema Drizzle: `src/db/schema`.
- Migraciones versionadas: `drizzle`.
- Seed: `src/db/seed/index.ts`.
- Cliente Neon con WebSockets y transacciones interactivas: `src/db/index.ts`.

Los importes se almacenan como centavos enteros. Los productos estándar guardan stock físico; los kits calculan disponibilidad y costo real desde sus componentes. El precio de venta y el costo comercial del kit son manuales.

## Calidad

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Despliegue

Vercel detecta Next.js desde el repositorio. Configurá las mismas variables de entorno para Preview y Production antes de aplicar la migración sobre cada base. El sitio temporal anterior permanece en el historial de Git; el runtime activo es App Router.

## Estado

Fase 1 implementada: scaffold, modelos, migración, seed, autenticación base, roles, layouts y pruebas de invariantes. Las interfaces CRUD y los flujos transaccionales se desarrollan en las fases siguientes descritas en `docs/architecture-first-deliverable.md`.
