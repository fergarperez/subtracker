# Architecture & Tech Stack Context

## 1. Core Stack

- **Framework:** Next.js (App Router) con TypeScript estricto.
- **API Layer:** Next.js Route Handlers (`app/api/**`) — **NO se usan Server Actions**.
- **Authentication:** Clerk (`@clerk/nextjs`).
- **Database:** NeonDB (PostgreSQL Serverless).
- **ORM:** Prisma ORM 7 (cliente generado en `generated/prisma`, ignorado en git; `postinstall` ejecuta `prisma generate`) con driver serverless de Neon (`@prisma/adapter-neon` / `@neondatabase/serverless`).
- **Validation:** Zod.
- **Styling:** Tailwind CSS + `shadcn/ui`.
- **Estructura:** `app/` en la raíz (sin `src/`); alias `@/*` → raíz. En Next 16 `middleware` se llama `proxy.ts`.
- **Testing:** Vitest (`npm run test`, tests en `__tests__/`) (unit & API integration tests) + Testing Library / Playwright (E2E básico).

## 2. Infrastructure & Deployment

- **Web App & API:** Desplegada en **Vercel** (Preview Deployments automáticos en ramas `feat/*` y `dev`; Production en `main`).
- **Database:** **NeonDB** (con branch de `dev` y branch de `main` aislados si se desea).
- **Automation Engine:** **n8n** autoalojado en VPS privado, comunicándose vía HTTPS con los endpoints `/api/webhooks/*` de Vercel.

## 3. Data Model (Prisma Schema)

Nota: Clerk gestiona la identidad del usuario; almacenamos `userId` (ID de usuario de Clerk, ej. `user_2abc...`) directamente en los modelos para evitar sincronizaciones complejas de webhooks de usuario.

```prisma
model UserSettings {
  userId              String   @id // Clerk userId
  defaultCurrency     String   @default("EUR")
  defaultReminderDays Int      @default(3)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

model Subscription {
  id              String    @id @default(cuid())
  userId          String    // Clerk userId (indexado para queries rápidas)
  name            String
  price           Decimal   @db.Decimal(10, 2)
  currency        String    @default("EUR")
  billingCycle    String    // "weekly" | "monthly" | "quarterly" | "yearly"
  nextBillingDate DateTime
  reminderDays    Int       @default(3)
  lastNotifiedFor DateTime? // Evita notificaciones duplicadas en el mismo ciclo
  category        String    @default("General")
  status          String    @default("active") // "active" | "paused" | "cancelled"
  cancelUrl       String?
  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([userId])
  @@index([status, nextBillingDate])
}
```

### Cambio planificado (Fase 4): email de aviso

Los avisos de n8n son para **todos los usuarios**, por **email**. Decisión: el email se guarda en `UserSettings` (no se consulta a Clerk en cada llamada).

```prisma
model UserSettings {
  // ...campos actuales...
  email String? // Email de aviso del usuario; lo usa /api/webhooks/reminders
}
```

- **Origen y sincronización:** se rellena desde Clerk (`currentUser()`) al hacer `upsert` de `UserSettings` en la primera petición autenticada, y se actualiza si cambia. Nunca se acepta un `email` enviado en el body para otro usuario.
- **Webhook:** `GET /api/webhooks/reminders` devuelve, por cada suscripción a avisar, el `email` del dueño junto a los datos del cobro. Los usuarios sin `email` se omiten.
- **Privacidad:** el email es dato personal; solo se expone en los endpoints `/api/webhooks/*`, protegidos con `N8N_API_KEY`, y nunca en `/api/subscriptions`.
- **Al implementarlo:** modificar `prisma/schema.prisma`, crear la migración y actualizar el bloque de arriba en el mismo commit.

## 4. API de suscripciones (Fase 2)

| Método | Ruta | Respuestas |
| --- | --- | --- |
| GET | `/api/subscriptions?status=active\|paused\|cancelled` | 200 lista (orden por `nextBillingDate` asc), 400, 401 |
| POST | `/api/subscriptions` | 201, 400, 401 |
| GET / PATCH / DELETE | `/api/subscriptions/[id]` | 200 / 204, 400, 401, 404 (inexistente o de otro usuario) |

- `userId` siempre sale de `auth()`; los schemas Zod son `strictObject` (rechazan `userId`, `lastNotifiedFor` y campos desconocidos).
- La respuesta (`toSubscriptionDto`) no incluye `userId` ni `lastNotifiedFor`; `price` es `number`, fechas en ISO 8601.
- PATCH/DELETE usan `updateMany`/`deleteMany` con `where: { id, userId }`.
- Sin nuevas variables de entorno ni cambios en Prisma. Dependencia añadida: `zod`.
