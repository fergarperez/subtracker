# Project Progress Tracker

**Current Phase:** Phase 3.5 (landing) en `feat/landing-public-for-all`, pendiente de PR a `dev`
**Active Branch:** `feat/landing-public-for-all` (flujo: `feat/*` → `dev` → `main`)
**Last Updated:** 2026-11-17

## 1. Roadmap & Milestones

### Phase 0: Setup, Security Base & Testing Harness (Current)

- [x] Definición de arquitectura (Next.js API + Clerk + NeonDB + Vercel + n8n).
- [x] Inicializar proyecto Next.js (App Router, TypeScript, Tailwind, shadcn/ui). Se mantiene `app/` en la raíz (sin `src/`).
- [x] Configurar Prisma con NeonDB y crear esquema inicial (`UserSettings`, `Subscription`). Migración inicial aplicada en Neon (dev).
- [x] Configurar **Vitest** para testing unitario y de endpoints API (`npm run test`).
- [x] Configurar cabeceras de seguridad HTTP en `next.config.ts` y `.env.example`.

### Phase 1: Clerk Authentication & Protected Shell

- [x] Integrar `@clerk/nextjs` (`ClerkProvider`, pantallas `/sign-in` y `/sign-up`).
- [x] Configurar `proxy.ts` (en Next 16 `middleware` pasó a llamarse Proxy) para proteger rutas privadas y endpoints `/api/*`.
- [x] Construir layout base en Dark Mode con `<UserButton />`.
- [x] Landing mínima en `/` con redirección automática a `/dashboard` si hay sesión activa (el diseño completo sigue en Phase 3.5).

### Phase 2: Subscriptions API & Core Business Logic (+ Tests)

- [x] Implementar utilidades puras en `lib/billing.ts` (normalización mensual/anual y cálculo de próximo ciclo) + **tests unitarios completos**.
- [x] Crear esquemas Zod en `lib/validations/subscription.ts` (incluyendo validación segura de `cancelUrl`) + **tests de validación**.
- [x] Implementar Route Handlers (`GET/POST /api/subscriptions` y `PATCH/DELETE /api/subscriptions/[id]`) + **tests de seguridad (401/404 ante accesos cruzados)**.

### Phase 3: Analytics Dashboard UI

- [x] Conectar UI con la API mediante `fetch` tipado.
- [x] Implementar KPI Cards (Gasto Mensual, Gasto Anual, Próximo Cobro).
- [x] Implementar sección de Próximos Vencimientos y listado filtrable/ordenable.
- [x] Implementar modal de creación/edición de suscripciones.

### Phase 3.5: Landing pública (después de la Fase 3)

- [x] Diseñar y construir la landing en `/` en español, según `ui-context.md` §4, con capturas del dashboard real.
- [x] ~~Redirigir `/` al dashboard con sesión activa~~ (Phase 1) — **revertido**: la landing es visible con sesión y el navbar muestra `Ir al dashboard`.

### Phase 4: n8n Reminders API & Workflow Export

- [ ] Añadir `email` a `UserSettings` (schema + migración), con `upsert` desde Clerk en la primera petición autenticada. El endpoint de reminders devuelve el email del dueño y omite usuarios sin email.
- [ ] Implementar `GET /api/webhooks/reminders`, `POST /api/webhooks/reminders/ack` y `POST /api/webhooks/rollover` con verificación segura de `N8N_API_KEY` (`timingSafeEqual`).
- [ ] Añadir tests de integración para los webhooks de n8n (token inválido, anti-duplicados con `lastNotifiedFor`, rollover de fechas).
- [ ] Exportar flujo JSON de n8n en `/n8n/workflow.json` y documentarlo en `README.md`.

### Phase 5: Vercel Deployment & Production Hardening

- [ ] Configurar variables de entorno en Vercel y ejecutar migraciones en NeonDB.
- [ ] Conectar instancia privada de n8n en VPS con los endpoints de producción y validar alertas reales.

---

## 2. In Progress

- Fase 3.5 en `feat/landing`: abrir PR a `dev` y revisar visualmente en navegador.
- Fase 2 en `feat/subscriptions-api`: abrir PR a `dev`; probar la API real contra Neon (requiere `DATABASE_URL` y migración aplicada).
- Fase 1 (fusionada en `dev`): sigue pendiente probar el flujo real con claves de Clerk.

## 3. Completed

- Definición completa de los 5 archivos de contexto.
- Fase 0: shadcn/ui (`components.json`, `components/ui/button.tsx`, `lib/utils.ts`), Prisma 7 + adapter Neon (`prisma/schema.prisma`, `prisma.config.ts`, `lib/prisma.ts`), Vitest (`vitest.config.mts`), cabeceras de seguridad + CSP básica.
- Tests añadidos: `__tests__/utils.test.ts` (smoke test de `cn`), `__tests__/route-access.test.ts` (clasificación de rutas protegidas/API/webhooks).
- Fase 1: `@clerk/nextjs` 7 (+ `@clerk/ui` tema oscuro, `@clerk/localizations` es-ES), `proxy.ts` (401 JSON en `/api/*` excepto `/api/webhooks/*`; `auth.protect()` en `/dashboard`), `/sign-in`, `/sign-up`, layout dark con `<UserButton />`, `/dashboard` placeholder, landing mínima.
- Fase 2: `lib/billing.ts` (`toMonthly`, `toYearly`, `addCycles`, `getNextBillingDate`; UTC, recorte a fin de mes), `lib/validations/subscription.ts` (Zod `strictObject`, `cancelUrl` solo http/https, rechaza `userId` en el body), `lib/subscriptions.ts` (DTO sin `userId`/`lastNotifiedFor`, helpers de respuesta), `app/api/subscriptions/route.ts` y `[id]/route.ts` (filtran siempre por `{ id, userId }`; acceso cruzado → 404).
- Tests Fase 2: `billing.test.ts`, `subscription-validation.test.ts`, `subscriptions-api.test.ts` (401, 400, 404 cruzado, userId de sesión). Total: 48 tests.
- Fase 3: `lib/dashboard.ts` (totales por divisa, próximos cobros, urgencia, filtros/orden, formato), `lib/api-client.ts` (fetch tipado), `components/dashboard/*` (KPIs, próximos vencimientos 7/15/30 días, listado filtrable/ordenable con pausar/editar/eliminar, modal crear/editar), `components/ui/dialog.tsx` (base-ui). Dependencia añadida: `swr`. Tests: `dashboard.test.ts` (9). Total: 57 tests.
- Fase 3.5: landing en `app/page.tsx` (navbar, hero, vista previa, 3 feature cards, footer) + `components/landing/product-preview.tsx`. La vista previa es una maqueta estática con datos de ejemplo, no capturas reales. Footer: "Hecho por Fernando" (ajustar el crédito si procede).
- Base de datos: `prisma/migrations/20261117014434_init` creada y aplicada en Neon; tablas `UserSettings` y `Subscription` verificadas con una consulta real.
- Repo: `master` renombrada a `main`; creada `dev`; publicado en GitHub (`fergarperez/subtracker`). PR #1 (Fase 0), #2 (des-trackeo del cliente Prisma generado) y #3 (contexto de producto) fusionadas.

## 4. Known Issues / Technical Debt

- Dashboard: el botón `+ Nueva suscripción` está en la cabecera de la página, no en el header del layout. Los KPIs se muestran por divisa (sin conversión entre divisas). Falta el desglose de gasto por categoría (overview). Sin tests de componentes (solo lógica pura).
- **Decidido, pendiente de implementar (Fase 4):** los avisos de n8n son para todos los usuarios, por email. Se añadirá `email String?` a `UserSettings` (sincronizado desde Clerk). Detalle en `architecture-context.md` §3.
- Migración inicial (`20261117014434_init`) aplicada en el Neon de desarrollo. En producción (Fase 5) se aplica con `npx prisma migrate deploy`, no `migrate dev`.
- La CSP incluye dominios de Clerk de desarrollo (`*.clerk.accounts.dev`, `*.clerk.com`); al pasar a instancia de producción con dominio propio (`clerk.<tu-dominio>`) habrá que añadirlo (Fase 5).
- `ClerkProvider` va dentro de `<Suspense>` en `app/layout.tsx` por `cacheComponents`.
- Rate limiting de webhooks pendiente (Fase 4).
- `next.config.ts` trae opciones experimentales (`cacheComponents`, `partialPrefetching`, `agentFeedback`) heredadas del scaffold; revisar si se mantienen.
