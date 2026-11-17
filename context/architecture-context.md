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
