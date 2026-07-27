# HouseCam + HousePet — primer entregable de arquitectura

Estado: **propuesta para revisión**  
Rama: `codex/next-changes`  
Alcance: diseño técnico previo a la implementación. Este documento no autoriza todavía la migración del sitio estático ni la construcción de pantallas.

## 1. Decisiones técnicas propuestas

- Una sola aplicación Next.js con App Router para HouseCam, HousePet, cuenta y administración.
- PostgreSQL en Neon como fuente de verdad para catálogo, perfiles, solicitudes, ventas, inventario, contenido y auditoría.
- Drizzle ORM con migraciones SQL versionadas mediante Drizzle Kit.
- Conexión PostgreSQL persistente o pooled compatible con transacciones interactivas. Las operaciones de inventario no usarán consultas HTTP aisladas.
- Clerk autentica identidades; `user_profiles.role` autoriza acciones de negocio.
- React Server Components por defecto. Solo selector de marca, búsqueda predictiva, carrito, controles interactivos y formularios que lo requieran serán Client Components.
- Dinero persistido como `bigint` en centavos ARS. En TypeScript se manipulará como `bigint` o string serializable en los límites RSC; nunca como float.
- Fechas persistidas en UTC y presentadas con la zona configurada, inicialmente `America/Argentina/Cordoba`.
- El carrito local contiene únicamente `productId`, `purchaseMode` y `quantity`. Precios, disponibilidad y totales siempre se recalculan en servidor.
- Las ventas confirmadas son inmutables. Una corrección requiere anulación y una venta nueva.
- Los kits se modelan desde el inicio, pero permanecen no publicables hasta que administración, cálculo de disponibilidad y descuento de componentes estén probados.

## 2. Árbol de carpetas propuesto

```txt
src/
  app/
    (public)/
      (housecam)/
        page.tsx
        productos/
          page.tsx
          [slug]/page.tsx
        categorias/[slug]/page.tsx
        buscar/page.tsx
        instalaciones/page.tsx
        nosotros/page.tsx
        contacto/page.tsx
      housepet/
        page.tsx
        productos/
          page.tsx
          [slug]/page.tsx
        categorias/[slug]/page.tsx
        buscar/page.tsx
      carrito/page.tsx
      solicitud/
        page.tsx
        enviada/[publicToken]/page.tsx
      privacidad/page.tsx
      terminos/page.tsx
    cuenta/
      layout.tsx
      page.tsx
      perfil/page.tsx
      solicitudes/
        page.tsx
        [id]/page.tsx
    admin/
      layout.tsx
      page.tsx
      productos/
      categorias/
      stock/
      solicitudes/
      ventas/
      clientes/
      contenido/
      configuracion/
      exportaciones/
    api/
      exports/[resource]/route.ts
      webhooks/clerk/route.ts
    sitemap.ts
    robots.ts
    layout.tsx
    not-found.tsx
    error.tsx
  components/
    brand/
      brand-logo.tsx
      brand-switcher.tsx
      storefront-theme.tsx
    catalog/
      product-card.tsx
      product-grid.tsx
      product-price.tsx
      availability-label.tsx
    cart/
      cart-drawer.tsx
      cart-line.tsx
      cart-summary.tsx
    forms/
      field-error.tsx
      form-status.tsx
    admin/
      admin-shell.tsx
      data-table.tsx
      confirmation-dialog.tsx
    ui/
  features/
    auth/
      permissions.ts
      user-context.ts
    products/
      product.schemas.ts
      product.types.ts
      product.queries.ts
    categories/
    cart/
      cart.schemas.ts
      cart.types.ts
      cart.domain.ts
    purchase-requests/
      purchase-request.schemas.ts
      purchase-request.domain.ts
    inventory/
      inventory.schemas.ts
      inventory.domain.ts
    sales/
      sale.schemas.ts
      sale.domain.ts
    customers/
    content/
    whatsapp/
      template.schemas.ts
      template.domain.ts
    analytics/
  db/
    schema/
      enums.ts
      users.ts
      catalog.ts
      purchase-requests.ts
      sales.ts
      inventory.ts
      content.ts
      audit.ts
      relations.ts
      index.ts
    migrations/
    seed/
      index.ts
      admin.ts
      settings.ts
    index.ts
  lib/
    auth/
      require-user.ts
      require-admin.ts
    validation/
    money/
      money.ts
      format-money.ts
    dates/
      business-time.ts
    seo/
    errors/
      application-error.ts
      action-result.ts
    markdown/
      sanitize-markdown.ts
  server/
    actions/
      products.ts
      categories.ts
      inventory.ts
      purchase-requests.ts
      sales.ts
      settings.ts
    services/
      product-service.ts
      category-service.ts
      inventory-service.ts
      purchase-request-service.ts
      whatsapp-service.ts
      sale-service.ts
      customer-service.ts
      content-service.ts
      seo-service.ts
      export-service.ts
      audit-service.ts
    repositories/
      product-repository.ts
      category-repository.ts
      inventory-repository.ts
      purchase-request-repository.ts
      sale-repository.ts
      settings-repository.ts
  stores/
    cart-store.ts
  types/
    branded.ts
    domain.ts
middleware.ts
drizzle.config.ts
```

Regla de dependencia:

```txt
UI → Server Action → servicio de dominio → repositorio → Drizzle/PostgreSQL
```

Los componentes no importan directamente el cliente de base de datos. Las acciones validan, autentican y delegan; no contienen reglas complejas de stock o dinero.

## 3. Diagrama textual de entidades y relaciones

```txt
user_profiles
  1 ── N purchase_requests
  1 ── N sales (customer_profile_id, opcional)

categories
  N ── 1 storefront lógico
  1 ── N products

products
  1 ── N product_images
  1 ── N product_specs
  N ── N products mediante kit_components
  1 ── N purchase_request_items
  1 ── N sale_items
  1 ── N stock_movements

purchase_requests
  1 ── N purchase_request_items
  0..1 ── 0..1 sales

sales
  1 ── N sale_items
  1 ── N sale_expenses
  1 ── N stock_movements
  0..1 ── 1 purchase_requests

site_settings
  1 fila global

storefront_content
  1 fila por storefront

faqs
  N ── 0..1 storefront

static_pages
  1 fila por slug permitido

slug_redirects
  N ── 1 storefront

audit_logs
  referencia lógica a cualquier entidad mediante entity_type + entity_id
```

### Invariantes relacionales

- `products.storefront` debe coincidir con `categories.storefront`.
- `products.sku` es único globalmente.
- `(storefront, slug)` es único en categorías y productos.
- Una imagen primaria como máximo por producto; publicar requiere exactamente una.
- `kit_components` solo acepta componentes `standard` durante el MVP.
- Una solicitud solo puede vincularse a una venta confirmada.
- Una venta confirmada o anulada no puede volver a borrador.
- Todo cambio en `products.stock_on_hand` genera el movimiento correspondiente dentro de la misma transacción.
- `stock_on_hand` nunca puede ser negativo.

## 4. Esquema Drizzle inicial

El esquema se divide por dominio. El siguiente inventario es el contrato inicial de tablas; la implementación generará migraciones SQL versionadas.

### Enums PostgreSQL

```ts
export const userRole = pgEnum("user_role", ["user", "admin"]);
export const storefront = pgEnum("storefront", ["housecam", "housepet"]);
export const requestSourceStorefront = pgEnum("request_source_storefront", [
  "housecam",
  "housepet",
  "mixed",
]);
export const productType = pgEnum("product_type", ["standard", "kit"]);
export const productBadge = pgEnum("product_badge", [
  "new",
  "offer",
  "recommended",
  "exclusive",
]);
export const purchaseMode = pgEnum("purchase_mode", ["unit", "pack10"]);
export const deliveryMethod = pgEnum("delivery_method", [
  "pickup_cordoba",
  "shipping_to_coordinate",
]);
export const purchaseRequestStatus = pgEnum("purchase_request_status", [
  "new",
  "contacted",
  "converted",
  "discarded",
]);
export const saleChannel = pgEnum("sale_channel", [
  "web_request",
  "whatsapp",
  "store",
  "instagram",
  "mercado_libre",
  "wholesale",
  "other",
]);
export const saleStatus = pgEnum("sale_status", [
  "draft",
  "confirmed",
  "cancelled",
  "partially_returned",
  "returned",
]);
export const saleExpenseType = pgEnum("sale_expense_type", [
  "shipping",
  "payment_fee",
  "packaging",
  "outsourced_installation",
  "other",
]);
export const stockMovementType = pgEnum("stock_movement_type", [
  "stock_in",
  "sale_out",
  "return_in",
  "correction",
  "damaged_out",
  "sale_cancelled_return",
  "kit_sale_out",
  "other",
]);
export const staticPageSlug = pgEnum("static_page_slug", [
  "about",
  "installations",
  "contact",
  "privacy",
  "terms",
]);
export const redirectEntityType = pgEnum("redirect_entity_type", [
  "product",
  "category",
  "page",
]);
```

### Tablas

#### `user_profiles`

- UUID PK.
- `clerk_user_id` único y obligatorio.
- Rol, identidad y datos de entrega.
- Email normalizado para búsqueda, sin usarlo como identidad primaria.
- Timestamps UTC.

#### `categories`

- UUID PK, storefront, nombre, slug, contenido, imagen, orden y estado.
- Archivo lógico mediante `archived_at`.
- Unique `(storefront, slug)`.
- Índice público `(storefront, is_active, sort_order)`.

#### `products`

- UUID PK y FK a categoría.
- Storefront, SKU, slug, tipo.
- Contenido, precios, costo, stock y flags comerciales.
- Estado editorial, badge, orden y SEO.
- Auditoría de creación/edición y archivo lógico.
- Checks de precios/costo/stock no negativos.
- Unique global `sku`; unique `(storefront, slug)`.

`stock_on_hand` representa stock físico únicamente para productos estándar. Para kits se mantiene en cero y la disponibilidad se calcula desde componentes.

#### `product_images`

- UUID PK, FK producto con `onDelete: cascade` solo mientras el producto sea físicamente eliminable.
- URL, pathname Blob, alt, orden y portada.
- Unique `(product_id, sort_order)`.
- Índice parcial único de portada por producto.

#### `product_specs`

- UUID PK, FK producto, label, value y orden.

#### `kit_components`

- PK compuesta `(kit_product_id, component_product_id)`.
- Cantidad positiva.
- Check kit != componente.
- Validación adicional en servicio: padre `kit`, hijo `standard`, misma marca y sin ciclos.

#### `purchase_requests`

- UUID PK.
- `request_number bigint generated always as identity`, único.
- Código legible único derivado del identity después del insert.
- Token público aleatorio de al menos 256 bits, único.
- Perfil opcional.
- Snapshot desnormalizado del cliente.
- Entrega, estado, storefront de origen y total listado.
- Snapshots de número y mensaje WhatsApp.
- Venta convertida opcional.

#### `purchase_request_items`

- UUID PK y FK a solicitud.
- FK a producto para trazabilidad, sin cascade.
- Snapshots de nombre, SKU y storefront.
- Presentación, cantidad, unidades físicas, precio y subtotal.

#### `sales`

- UUID PK e identity numérico único.
- Código legible único.
- Solicitud y cliente opcionales.
- Snapshot de cliente y texto libre.
- Canal, estado, totales y notas.
- Identidades Clerk de creador, confirmador y anulador.
- Fechas de confirmación/anulación y motivo.
- Unique parcial para evitar más de una venta confirmada por solicitud.

#### `sale_items`

- UUID PK, venta y producto.
- Snapshots de nombre, SKU, storefront y presentación.
- Cantidades, precios listado/final, costo histórico e importes calculados.
- Los campos financieros quedan congelados al confirmar.

#### `sale_expenses`

- UUID PK, venta, tipo, descripción e importe no negativo.

#### `stock_movements`

- UUID PK.
- Producto, venta opcional y tipo.
- `delta`, `stock_before`, `stock_after`.
- Nota y actor Clerk.
- Timestamps.
- Check `stock_after >= 0`.
- Check `stock_after = stock_before + delta`.
- Índices `(product_id, created_at desc)` y `sale_id`.

#### Contenido, configuración y soporte

- `site_settings`: una fila con ID constante y columnas tipadas para negocio, WhatsApp, retiro, redes, SEO y zona horaria.
- `storefront_content`: PK storefront, campos tipados por sección y selecciones destacadas mediante tablas de relación dedicadas.
- `static_pages`: slug enum, contenido Markdown, SEO y timestamps.
- `faqs`: storefront nullable, contenido, orden y estado.
- `audit_logs`: actor, acción, entidad, before/after JSONB y metadata.
- `slug_redirects`: old/new path, storefront y tipo, con old path único.

### Restricciones que requieren SQL de migración

Drizzle declarará tablas e índices, pero estas reglas se reforzarán con SQL versionado:

- Índice parcial para una imagen primaria por producto.
- Índice parcial para una venta confirmada por solicitud.
- Trigger diferido o validación transaccional para igualdad de storefront entre producto y categoría.
- Prohibición de actualizar o borrar líneas financieras de una venta confirmada.
- Prohibición de cambiar stock fuera de las funciones/servicios autorizados. En el MVP se controla por permisos de aplicación y auditoría; una función SQL dedicada puede evaluarse antes de producción.

## 5. Lista consolidada de enums

| Enum | Valores |
|---|---|
| `user_role` | `user`, `admin` |
| `storefront` | `housecam`, `housepet` |
| `request_source_storefront` | `housecam`, `housepet`, `mixed` |
| `product_type` | `standard`, `kit` |
| `product_badge` | `new`, `offer`, `recommended`, `exclusive` |
| `purchase_mode` | `unit`, `pack10` |
| `delivery_method` | `pickup_cordoba`, `shipping_to_coordinate` |
| `purchase_request_status` | `new`, `contacted`, `converted`, `discarded` |
| `sale_channel` | `web_request`, `whatsapp`, `store`, `instagram`, `mercado_libre`, `wholesale`, `other` |
| `sale_status` | `draft`, `confirmed`, `cancelled`, `partially_returned`, `returned` |
| `sale_expense_type` | `shipping`, `payment_fee`, `packaging`, `outsourced_installation`, `other` |
| `stock_movement_type` | `stock_in`, `sale_out`, `return_in`, `correction`, `damaged_out`, `sale_cancelled_return`, `kit_sale_out`, `other` |
| `static_page_slug` | `about`, `installations`, `contact`, `privacy`, `terms` |
| `redirect_entity_type` | `product`, `category`, `page` |

No se crea un enum de estado de pago, envío, reserva o pedido porque esos conceptos no existen en el MVP.

## 6. Estrategia transaccional de ventas e inventario

### 6.1 Crear o editar borrador

- No modifica stock.
- Recalcula precios listados desde productos actuales.
- Permite precio final acordado, pero exige nota cuando difiere del listado.
- No congela todavía el costo histórico; muestra una estimación.

### 6.2 Confirmar venta

Una única transacción PostgreSQL con aislamiento `READ COMMITTED` y bloqueos explícitos:

1. Obtener la venta `FOR UPDATE`.
2. Rechazar si no está en `draft`.
3. Obtener líneas y expandir kits a componentes físicos.
4. Agregar por producto las unidades físicas totales requeridas.
5. Ordenar los UUID de producto para adquirir bloqueos siempre en el mismo orden y reducir deadlocks.
6. Leer todos los productos físicos `FOR UPDATE`.
7. Validar existencia, stock suficiente y coherencia de línea.
8. Congelar en `sale_items` nombre, SKU, marca, presentación, precio listado, precio final y costo unitario.
9. Descontar stock mediante actualización condicional:

   ```sql
   update products
   set stock_on_hand = stock_on_hand - :required
   where id = :id and stock_on_hand >= :required;
   ```

10. Exigir una fila actualizada por producto.
11. Insertar un movimiento por producto físico con before/after.
12. Recalcular todos los totales con enteros.
13. Cambiar la venta a `confirmed` con actor y timestamp usando condición `status = 'draft'`.
14. Si existe solicitud vinculada, cambiarla a `converted` y enlazar `converted_sale_id`.
15. Insertar `audit_logs`.
16. Commit.

Si cualquier paso falla, la transacción completa hace rollback. Dos confirmaciones concurrentes no pueden descontar dos veces porque la venta se bloquea y el cambio de estado es condicional.

### 6.3 Anular venta

Una única transacción:

1. Bloquear venta `FOR UPDATE`.
2. Exigir estado `confirmed` y motivo no vacío.
3. Leer movimientos de salida originales.
4. Bloquear productos afectados en orden estable.
5. Restaurar exactamente los deltas físicos de esos movimientos, no recalcular desde el catálogo actual.
6. Insertar movimientos `sale_cancelled_return` con referencia a venta.
7. Cambiar estado a `cancelled`, persistir actor, fecha y motivo.
8. La solicitud vinculada vuelve a `contacted`, no a `new`, salvo decisión de negocio distinta.
9. Insertar auditoría y commit.

La condición de estado impide anular dos veces. La venta, sus líneas, costos y totales no se eliminan.

### 6.4 Ajuste manual

- Bloquear producto.
- Calcular `stock_after`.
- Rechazar negativos.
- Actualizar producto e insertar movimiento en la misma transacción.
- Nota obligatoria para `correction`, `damaged_out` y `other`.

## 7. Estrategia de snapshots históricos

### Solicitud de compra

Al crearla se congelan:

- datos del cliente y modalidad de entrega;
- nombre, SKU y marca de cada producto;
- presentación, cantidad y unidades físicas;
- precio vigente y subtotal;
- total listado;
- número de WhatsApp;
- mensaje exacto generado.

Cambiar catálogo, perfil o plantilla después no altera la solicitud.

### Venta

Al confirmar se congelan:

- cliente o texto libre;
- nombre, SKU y marca;
- presentación y unidades físicas;
- precio listado;
- precio final acordado;
- costo vigente por unidad física;
- ingreso, costo y margen de línea;
- gastos y totales de venta.

Los snapshots son columnas explícitas para los datos consultados frecuentemente. `jsonb` se reserva para el snapshot completo de cliente y metadata de auditoría, evitando ocultar métricas financieras en JSON.

### Inventario

Los movimientos guardan before, delta y after. La anulación restaura desde movimientos históricos, no desde la composición actual de un kit ni desde la ficha vigente.

## 8. Estrategia de autenticación y autorización

### Identidad

- Clerk gestiona sesión, login y alta.
- Un webhook sincroniza creación/actualización básica de `user_profiles`.
- Las páginas públicas no requieren sesión.

### Rol

- `user_profiles.role` es la fuente de verdad.
- El rol nunca se acepta desde formularios, metadata pública del cliente ni Zustand.
- El primer administrador se crea mediante seed controlado por `INITIAL_ADMIN_EMAIL`.
- Promover o degradar administradores requerirá una acción administrativa auditada; no se implementa autoservicio.

### Capas de defensa

1. `middleware.ts` exige autenticación para `/cuenta` y `/admin`.
2. El layout de `/admin` llama `requireAdmin()`.
3. Cada Server Action o Route Handler sensible vuelve a llamar `requireAdmin()`.
4. Los servicios reciben un contexto de actor ya autorizado.
5. Los repositorios nunca infieren permisos.

### Propiedad de datos

- Un usuario accede a solicitudes mediante `user_profile_id` vinculado a su `clerk_user_id`.
- Un token público permite ver solo la confirmación mínima de una solicitud.
- El código legible nunca autoriza acceso.
- Exportaciones, imágenes, inventario, ventas, configuración y contenido son solo admin.

### Auditoría

Se auditan al menos:

- altas, cambios, duplicación, archivo y eliminación segura de productos;
- ajustes de stock;
- creación, confirmación y anulación de ventas;
- cambios de estado de solicitudes;
- cambios de roles;
- cambios de WhatsApp, negocio y SEO.

## 9. Contratos Zod principales

Los esquemas de acción usan `strict()` y normalización explícita. Los IDs son UUID y los importes llegan como strings decimales de interfaz que el servidor convierte a centavos.

```ts
const cartLineSchema = z.object({
  productId: z.string().uuid(),
  purchaseMode: z.enum(["unit", "pack10"]),
  quantity: z.number().int().min(1).max(999),
}).strict();

const createPurchaseRequestSchema = z.object({
  lines: z.array(cartLineSchema).min(1).max(100),
  customer: z.object({
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().min(6).max(30),
    taxId: z.string().trim().min(7).max(20),
    addressLine1: z.string().trim().min(1).max(200),
    addressLine2: z.string().trim().max(200).optional(),
    city: z.string().trim().min(1).max(100),
    province: z.string().trim().min(1).max(100),
    postalCode: z.string().trim().min(1).max(20),
  }).strict(),
  deliveryMethod: z.enum(["pickup_cordoba", "shipping_to_coordinate"]),
  notes: z.string().trim().max(2000).optional(),
}).strict();

const createProductSchema = z.object({
  storefront: z.enum(["housecam", "housepet"]),
  categoryId: z.string().uuid(),
  sku: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(180),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  productType: z.enum(["standard", "kit"]),
  shortDescription: z.string().trim().min(1).max(320),
  description: z.string().max(30_000),
  unitPrice: moneyInputSchema,
  pack10Price: moneyInputSchema.nullable(),
  costPerUnit: moneyInputSchema,
  allowDirectWhatsapp: z.boolean(),
  allowCart: z.boolean(),
  installationInquiryEnabled: z.boolean(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  badge: z.enum(["new", "offer", "recommended", "exclusive"]).nullable(),
  sortOrder: z.number().int().min(0),
}).strict();

const stockMovementSchema = z.object({
  productId: z.string().uuid(),
  type: z.enum([
    "stock_in",
    "return_in",
    "correction",
    "damaged_out",
    "other",
  ]),
  quantity: z.number().int().positive(),
  direction: z.enum(["in", "out"]).optional(),
  note: z.string().trim().max(1000).optional(),
}).strict();

const saleDraftLineSchema = z.object({
  productId: z.string().uuid(),
  purchaseMode: z.enum(["unit", "pack10"]),
  quantity: z.number().int().min(1),
  finalPresentationPrice: moneyInputSchema,
  priceDifferenceNote: z.string().trim().max(1000).optional(),
}).strict();

const createSaleDraftSchema = z.object({
  purchaseRequestId: z.string().uuid().optional(),
  customerProfileId: z.string().uuid().optional(),
  customerFreeText: z.string().trim().max(500).optional(),
  channel: z.enum([
    "web_request",
    "whatsapp",
    "store",
    "instagram",
    "mercado_libre",
    "wholesale",
    "other",
  ]),
  lines: z.array(saleDraftLineSchema).min(1).max(100),
  expenses: z.array(saleExpenseSchema).max(50),
  notes: z.string().trim().max(5000).optional(),
}).strict();

const confirmSaleSchema = z.object({
  saleId: z.string().uuid(),
  expectedUpdatedAt: z.string().datetime(),
}).strict();

const cancelSaleSchema = z.object({
  saleId: z.string().uuid(),
  reason: z.string().trim().min(3).max(1000),
}).strict();

const whatsappTemplateSchema = z.object({
  phoneNumber: z.string().trim().regex(/^\d{8,15}$/),
  directPurchaseTemplate: validatedTemplateSchema,
  cartTemplate: validatedTemplateSchema,
  outOfStockTemplate: validatedTemplateSchema,
  installationTemplate: validatedTemplateSchema,
  generalInquiryTemplate: validatedTemplateSchema,
  greeting: z.string().max(500).optional(),
  closing: z.string().max(500).optional(),
}).strict();
```

Validaciones de dominio que no se delegan a Zod:

- storefront de producto y categoría;
- stock suficiente agregado por producto;
- disponibilidad de pack de 10;
- composición y disponibilidad de kit;
- precio y costo actuales;
- estado válido de venta/solicitud;
- permisos y propiedad;
- variables permitidas de plantillas;
- portada requerida antes de publicar.

## 10. Mapa de rutas

### Públicas

```txt
/
/productos
/productos/[slug]
/categorias/[slug]
/buscar
/housepet
/housepet/productos
/housepet/productos/[slug]
/housepet/categorias/[slug]
/housepet/buscar
/instalaciones
/nosotros
/contacto
/carrito
/solicitud
/solicitud/enviada/[publicToken]
/privacidad
/terminos
```

### Cuenta autenticada

```txt
/cuenta
/cuenta/perfil
/cuenta/solicitudes
/cuenta/solicitudes/[id]
```

### Administración

```txt
/admin
/admin/productos
/admin/productos/nuevo
/admin/productos/[id]
/admin/categorias
/admin/categorias/nueva
/admin/categorias/[id]
/admin/stock
/admin/stock/movimientos
/admin/solicitudes
/admin/solicitudes/[id]
/admin/ventas
/admin/ventas/nueva
/admin/ventas/[id]
/admin/clientes
/admin/clientes/[id]
/admin/contenido
/admin/contenido/housecam
/admin/contenido/housepet
/admin/contenido/paginas
/admin/configuracion
/admin/configuracion/whatsapp
/admin/configuracion/negocio
/admin/configuracion/seo
/admin/exportaciones
```

### Route Handlers

```txt
/api/webhooks/clerk
/api/exports/[resource]
```

La búsqueda normal, acciones de catálogo, carrito, solicitudes, ventas e inventario usan Server Actions y servicios; no se convierten innecesariamente en API REST.

## 11. Plan de fases y criterios de finalización

### Fase 0 — aprobación arquitectónica

- Este documento revisado y aprobado.
- Decisiones pendientes resueltas.
- Proveedor Neon, proyecto Clerk y Blob disponibles.
- Estrategia de migración desde la portada temporal aprobada.

### Fase 1 — fundamentos

- Next.js, TypeScript strict, Tailwind, lint, formato y tests configurados.
- Neon transaccional, Drizzle y migraciones reproducibles.
- Clerk, middleware, perfil local y seed del primer admin.
- Esquema inicial completo y seed mínimo.
- Layout público/admin y tokens visuales de ambas marcas.
- Pruebas de autorización y migraciones en CI.

No finaliza si una migración no puede ejecutarse desde cero o si `/admin` depende solo de ocultamiento visual.

### Fase 2 — catálogo administrativo

- CRUD, duplicación, publicación, archivo y borrado seguro.
- Categorías con segregación por marca.
- Especificaciones e imágenes Blob.
- Costos, precios y configuración de pack de 10.
- Ajustes de stock auditados.
- Configuración de WhatsApp.
- Tests de invariantes de catálogo e imágenes.

### Fase 3 — inventario y ventas

- Borradores de venta sin impacto en stock.
- Confirmación y anulación transaccionales.
- Kits soportados en dominio, no publicables todavía.
- Gastos, márgenes, dashboard base y CSV.
- Tests concurrentes de doble confirmación, rollback y no-negatividad.

No finaliza sin pruebas reales contra PostgreSQL.

### Fase 4 — tiendas públicas

- HouseCam y HousePet con identidades diferenciadas.
- Selector accesible de marca.
- Catálogo, categorías, fichas, búsqueda y filtros.
- Reglas públicas de stock sin revelar cantidades.
- Compra directa validada en servidor.
- SEO base, sitemap, robots y metadata.

### Fase 5 — carrito, solicitudes y cuentas

- Carrito Zustand mixto y persistente.
- Validación agregada de unidades físicas.
- Solicitud con snapshots y token seguro.
- Flujo WhatsApp con pantalla de respaldo.
- Perfil e historial con control de propiedad.
- Tests E2E de invitado, usuario y carrito mixto.

### Fase 6 — contenido y lanzamiento

- Contenido fijo administrable, páginas y FAQs.
- SEO avanzado y datos estructurados veraces.
- Analytics sin PII.
- Auditoría, accesibilidad, performance y seguridad revisadas.
- Checklist Vercel, variables, backups y rollback.
- README operativo completo.

## 12. Decisiones aprobadas

1. **Anulación y solicitud vinculada:** la solicitud vuelve a `contacted`.
2. **DNI/CUIT:** es opcional en perfiles y solicitudes.
3. **Código legible:** se usan prefijos `HC`, `HP` y `MX` según HouseCam, HousePet o carrito mixto.
4. **Rol administrativo:** solo el administrador inicial puede promover o degradar administradores.
5. **Eliminación física:** la interfaz del MVP solo permite archivar; no expone borrado físico.
6. **Venta vinculada a solicitud:** una solicitud permite una única venta confirmada.
7. **Kits:** el precio de venta y el costo comercial se cargan manualmente. El costo real de materiales y el margen real se calculan desde los costos vigentes de los componentes al confirmar la venta.
8. **Devoluciones:** los estados quedan preparados sin interfaz ni mutaciones hasta una fase posterior.

## 13. Decisiones operativas todavía pendientes

Estas decisiones no bloquean el scaffold inicial, pero deben cerrarse antes de usar datos reales:

1. **Retención de PII y auditoría:** definir período de conservación y política de anonimización/borrado.
2. **Migración del sitio temporal:** definir si seguirá en producción hasta terminar la tienda pública o si se reemplazará antes mediante previews.
