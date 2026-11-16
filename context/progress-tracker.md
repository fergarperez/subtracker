# Project Progress Tracker

**Current Phase:** Phase 0 — Project Definition & Repository Setup
**Active Branch:** `main`
**Last Updated:** 2026-11-15

## 1. Roadmap & Milestones

### Phase 0: Setup, Security Base & Testing Harness (Current)

- [x] Definición de arquitectura (Next.js API + Clerk + NeonDB + Vercel + n8n).
- [ ] Inicializar proyecto Next.js (App Router, TypeScript, Tailwind, shadcn/ui).
- [ ] Configurar Prisma con NeonDB y crear esquema inicial (`UserSettings`, `Subscription`).
- [ ] Configurar **Vitest** para testing unitario y de endpoints API.
- [ ] Configurar cabeceras de seguridad HTTP en `next.config.ts` y `.env.example`.

### Phase 1: Clerk Authentication & Protected Shell

- [ ] Integrar `@clerk/nextjs` (`ClerkProvider`, pantallas `/sign-in` y `/sign-up`).
- [ ] Configurar `src/middleware.ts` para proteger rutas privadas y endpoints `/api/*`.
- [ ] Construir layout base en Dark Mode con `<UserButton />`.

### Phase 2: Subscriptions API & Core Business Logic (+ Tests)

- [ ] Implementar utilidades puras en `src/lib/billing.ts` (normalización mensual/anual y cálculo de próximo ciclo) + **tests unitarios completos**.
- [ ] Crear esquemas Zod en `src/lib/validations/subscription.ts` (incluyendo validación segura de `cancelUrl`) + **tests de validación**.
- [ ] Implementar Route Handlers (`GET/POST /api/subscriptions` y `PATCH/DELETE /api/subscriptions/[id]`) + **tests de seguridad (401/404 ante accesos cruzados)**.

### Phase 3: Analytics Dashboard UI

- [ ] Conectar UI con la API mediante `TanStack Query` / `fetch` tipado.
- [ ] Implementar KPI Cards (Gasto Mensual, Gasto Anual, Próximo Cobro).
- [ ] Implementar sección de Próximos Vencimientos y listado filtrable/ordenable.
- [ ] Implementar modal de creación/edición de suscripciones.

### Phase 4: n8n Reminders API & Workflow Export

- [ ] Implementar `GET /api/webhooks/reminders`, `POST /api/webhooks/reminders/ack` y `POST /api/webhooks/rollover` con verificación segura de `N8N_API_KEY` (`timingSafeEqual`).
- [ ] Añadir tests de integración para los webhooks de n8n (token inválido, anti-duplicados con `lastNotifiedFor`, rollover de fechas).
- [ ] Exportar flujo JSON de n8n en `/n8n/workflow.json` y documentarlo en `README.md`.

### Phase 5: Vercel Deployment & Production Hardening

- [ ] Configurar variables de entorno en Vercel y ejecutar migraciones en NeonDB.
- [ ] Conectar instancia privada de n8n en VPS con los endpoints de producción y validar alertas reales.

---

## 2. In Progress

- Documentación de arquitectura y reglas lista en `/context`. Siguiente paso: inicializar el repositorio en rama `chore/initial-setup`.

## 3. Completed

- Definición completa de los 5 archivos de contexto (`project-overview.md`, `ai-workflow-rules.md`, `ui-context.md`, `architecture-context.md`, `progress-tracker.md`).

## 4. Known Issues / Technical Debt

- _Ninguno todavía._
