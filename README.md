# HouseCam Platform

Base unificada para HouseCam, HousePet y su operación interna. El proyecto usa Next.js App Router, TypeScript estricto, Tailwind CSS, Clerk, Neon PostgreSQL, Drizzle ORM, Zod, Zustand, Vercel Blob y Analytics.

## Requisitos

- Node.js 20.9 o posterior.
- Una base PostgreSQL en Neon.
- Una aplicación de Clerk.
- Un Blob Store de Vercel para la carga de imágenes.

## Desarrollo local

1. Instalá dependencias con `npm install`.
2. Copiá `.env.example` a `.env.local` y completá las variables.
3. Ejecutá `npm run db:migrate` y `npm run db:seed`.
4. Iniciá el entorno con `npm run dev`.

## Rutas

- `/`: portada temporal de HouseCam.
- `/desarrollo`: vista previa del sitio.
- `/productos`: tienda pública.
- `/nosotros`: Sobre nosotros.
- `/housepet`: portada HousePet.
- `/admin`: administración protegida por Clerk.

Las páginas públicas reutilizan un único header, navegación, selector de marca y toggle claro/oscuro.

## Administrador

El seed crea el administrador inicial usando `INITIAL_ADMIN_CLERK_USER_ID` e `INITIAL_ADMIN_EMAIL`. La Fase 2 incluye:

- categorías separadas por marca;
- productos con alta, edición, duplicación, publicación y archivo lógico;
- precios unitarios y pack de 10, costos y stock;
- especificaciones e imágenes en Vercel Blob;
- kits con precio manual, componentes, costo material y disponibilidad calculados;
- ajustes de stock transaccionales y auditados;
- configuración del número de WhatsApp.

No se permite publicar un kit sin componentes ni archivar una categoría que todavía tenga productos. Los importes se almacenan como centavos enteros.

## Variables de entorno

Consultá `.env.example`. Para que el admin sea operativo se requieren, como mínimo:

- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `INITIAL_ADMIN_CLERK_USER_ID`
- `INITIAL_ADMIN_EMAIL`
- `BLOB_READ_WRITE_TOKEN`

Sin esas variables las páginas públicas funcionan y el admin se muestra en modo de configuración, sin permitir mutaciones.

## Calidad

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

El detalle de las fases está en `docs/architecture-first-deliverable.md`.
