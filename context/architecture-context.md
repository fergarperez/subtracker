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
- **Scheduled jobs:** **Vercel Cron** (`vercel.json`) ejecuta cada día `GET /api/cron/reminders`. Vercel envía `Authorization: Bearer $CRON_SECRET`.
- **Email:** **Resend** (envío transaccional, por lotes si hace falta). Remitente configurable con `EMAIL_FROM`.
- **Límites Hobby a respetar:** una ejecución diaria como máximo (una expresión más frecuente hace fallar el deploy), precisión de ±59 min y 300 s por ejecución. El job debe ser idempotente y poder reanudarse si se corta.

## 3. Data Model (Prisma Schema)

Nota: Clerk gestiona la identidad del usuario; almacenamos `userId` (ID de usuario de Clerk, ej. `user_2abc...`) directamente en los modelos para evitar sincronizaciones complejas de webhooks de usuario.

```prisma
model UserSettings {
  userId              String   @id // Clerk userId
  defaultCurrency     String   @default("EUR")
  defaultReminderDays Int      @default(3)
  email               String?  // Email de aviso (sincronizado desde Clerk)
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

### Email de aviso (Fase 4, implementado)

Los avisos son para **todos los usuarios**, por **email**, enviados por el cron de Vercel con Resend. Decisión: el email se guarda en `UserSettings` (no se consulta a Clerk en cada ejecución).

```prisma
model UserSettings {
  // ...campos actuales...
  email String? // Email de aviso del usuario; lo usa el job /api/cron/reminders
}
```

- **Origen y sincronización:** se rellena desde Clerk (`currentUser()`) al hacer `upsert` de `UserSettings` en la primera petición autenticada, y se actualiza si cambia. Nunca se acepta un `email` enviado en el body para otro usuario.
- **Job de recordatorios:** `GET /api/cron/reminders` valida `Authorization: Bearer <CRON_SECRET>` con `crypto.timingSafeEqual` y devuelve 401 si no coincide. Los usuarios sin `email` se omiten.
- **Lógica pura en `lib/reminders.ts`** (con tests): qué suscripciones avisar (`status = active`, hoy >= `nextBillingDate - reminderDays`, y `lastNotifiedFor` distinto del `nextBillingDate` actual), qué fechas avanzar y cómo agrupar los emails por usuario.
- **Idempotencia:** `lastNotifiedFor` guarda el `nextBillingDate` ya notificado; se actualiza solo tras enviar el email con éxito, así una ejecución repetida o cortada no duplica avisos. El rollover usa `getNextBillingDate` de `lib/billing.ts`.
- **Proxy:** `/api/cron/*` se excluye del 401 de Clerk en `proxy.ts` (se autentica con `CRON_SECRET`, no con sesión). Sustituye a la exclusión actual de `/api/webhooks/*`; actualizar `__tests__/route-access.test.ts`.
- **Demo de la landing:** `buildDemoReminders(now)` en `lib/reminders.ts` alimenta `buildReminderEmail`, así la demo y el email real comparten plantilla.
- **Variables de entorno nuevas:** `CRON_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`. Se retira `N8N_API_KEY`. Opcional: `NEXT_PUBLIC_CONTACT_EMAIL` (contacto en las páginas legales).
- **Privacidad:** el email es dato personal; solo se usa dentro del job en el servidor. Ninguna respuesta HTTP lo devuelve, ni `/api/subscriptions` ni el propio endpoint de cron (responde solo con contadores).
- **Implementación:** `lib/user-settings.ts` (sync del email), `lib/reminders.ts`, `lib/cron-auth.ts`, `lib/email.ts` (Resend `POST /emails/batch` por `fetch`), `app/api/cron/reminders/route.ts` y `vercel.json` (`0 7 * * *`). Orden del job: rollover → envío → marcar `lastNotifiedFor` solo si el envío fue correcto.

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
