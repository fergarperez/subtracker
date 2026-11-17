# Project Progress Tracker

**Current Phase:** Phase 0 — Setup completado, pendiente de merge a `dev`
**Active Branch:** `chore/initial-setup` (ramas `main` y `dev` creadas)
**Last Updated:** 2026-11-17

## 1. Roadmap & Milestones

### Phase 0: Setup, Security Base & Testing Harness (Current)

- [x] Definición de arquitectura (Next.js API + Clerk + NeonDB + Vercel + n8n).
- [x] Inicializar proyecto Next.js (App Router, TypeScript, Tailwind, shadcn/ui). Se mantiene `app/` en la raíz (sin `src/`).
- [x] Configurar Prisma con NeonDB y crear esquema inicial (`UserSettings`, `Subscription`). Pendiente: aplicar la primera migración cuando exista `DATABASE_URL` real de Neon.
- [x] Configurar **Vitest** para testing unitario y de endpoints API (`npm run test`).
- [x] Configurar cabeceras de seguridad HTTP en `next.config.ts` y `.env.example`.

### Phase 1: Clerk Authentication & Protected Shell

- [ ] Integrar `@clerk/nextjs` (`ClerkProvider`, pantallas `/sign-in` y `/sign-up`).
- [ ] Configurar `proxy.ts` (en Next 16 `middleware` pasó a llamarse Proxy) para proteger rutas privadas y endpoints `/api/*`.
- [ ] Construir layout base en Dark Mode con `<UserButton />`.
- [ ] Implementar Landing Page pública en `/` con redirección automática a `/dashboard` si hay sesión activa de Clerk.

### Phase 2: Subscriptions API & Core Business Logic (+ Tests)

- [ ] Implementar utilidades puras en `lib/billing.ts` (normalización mensual/anual y cálculo de próximo ciclo) + **tests unitarios completos**.
- [ ] Crear esquemas Zod en `lib/validations/subscription.ts` (incluyendo validación segura de `cancelUrl`) + **tests de validación**.
- [ ] Implementar Route Handlers (`GET/POST /api/subscriptions` y `PATCH/DELETE /api/subscriptions/[id]`) + **tests de seguridad (401/404 ante accesos cruzados)**.

### Phase 3: Analytics Dashboard UI

- [ ] Conectar UI con la API mediante `fetch` tipado.
- [ ] Implementar KPI Cards (Gasto Mensual, Gasto Anual, Próximo Cobro).
- [ ] Implementar sección de Próximos Vencimientos y listado filtrable/ordenable.
- [ ] Implementar modal de creación/edición de suscripciones.

### Phase 3.5: Landing pública (después de la Fase 3)

- [ ] Diseñar y construir la landing en `/` en español, según `ui-context.md` §4, con capturas del dashboard real.
- [ ] Redirigir `/` al dashboard cuando hay sesión activa.

### Phase 4: n8n Reminders API & Workflow Export

- [ ] Implementar `GET /api/webhooks/reminders`, `POST /api/webhooks/reminders/ack` y `POST /api/webhooks/rollover` con verificación segura de `N8N_API_KEY` (`timingSafeEqual`).
- [ ] Añadir tests de integración para los webhooks de n8n (token inválido, anti-duplicados con `lastNotifiedFor`, rollover de fechas).
- [ ] Exportar flujo JSON de n8n en `/n8n/workflow.json` y documentarlo en `README.md`.

### Phase 5: Vercel Deployment & Production Hardening

- [ ] Configurar variables de entorno en Vercel y ejecutar migraciones en NeonDB.
- [ ] Conectar instancia privada de n8n en VPS con los endpoints de producción y validar alertas reales.

---

## 2. In Progress

- Rama `chore/initial-setup` lista para merge a `dev`. Siguiente paso: Fase 1 (Clerk) en `feat/clerk-auth`.

## 3. Completed

- Definición completa de los 5 archivos de contexto.
- Fase 0: shadcn/ui (`components.json`, `components/ui/button.tsx`, `lib/utils.ts`), Prisma 7 + adapter Neon (`prisma/schema.prisma`, `prisma.config.ts`, `lib/prisma.ts`), Vitest (`vitest.config.mts`), cabeceras de seguridad + CSP básica.
- Tests añadidos: `__tests__/utils.test.ts` (smoke test de `cn`).
- Repo: `master` renombrada a `main`; creada `dev`.

## 4. Known Issues / Technical Debt

- **Decisión pendiente (bloquea la Fase 4):** los avisos de n8n son para todos los usuarios, pero el modelo solo guarda el `userId` de Clerk. Hay que decidir cómo obtiene n8n el contacto de cada usuario (p. ej. email vía Clerk Backend API en el endpoint de reminders, o campo propio en `UserSettings`) y el canal (email vs. Telegram). Al decidirlo, actualizar `architecture-context.md`.
- Falta aplicar la migración inicial en Neon (`npx prisma migrate dev`) con una `DATABASE_URL` real.
- La CSP actual no incluye dominios de Clerk: hay que ampliarla en la Fase 1.
- Rate limiting de webhooks pendiente (Fase 4).
- `next.config.ts` trae opciones experimentales (`cacheComponents`, `partialPrefetching`, `agentFeedback`) heredadas del scaffold; revisar si se mantienen.
