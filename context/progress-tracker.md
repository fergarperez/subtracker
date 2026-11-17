# Project Progress Tracker

**Current Phase:** Phase 4 redefinida (Vercel Cron + Resend en lugar de n8n); fases 0 a 3.5 fusionadas en `dev`
**Active Branch:** `chore/reminders-cron` (flujo: `feat/*` → `dev` → `main`)
**Last Updated:** 2026-11-17

## 1. Roadmap & Milestones

### Phase 0: Setup, Security Base & Testing Harness (Current)

- [x] Definición de arquitectura (Next.js API + Clerk + NeonDB + Vercel; avisos con Vercel Cron + Resend, antes n8n).
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

### Phase 4: Reminders con Vercel Cron + Resend

Decisión (2026-11-17): se sustituye n8n por un cron de Vercel que ejecuta el job en la propia app. Motivos: sin dependencia de un VPS propio, lógica versionada y testeable con Vitest, menos endpoints y menos superficie de ataque, y el email del usuario no sale del servidor.

- [ ] Añadir `email` a `UserSettings` (schema + migración; quitar de paso la línea `url = env(...)` del bloque `generator`, que Prisma 7 ignora), con `upsert` desde Clerk en la primera petición autenticada.
- [ ] Implementar `lib/reminders.ts` (selección de suscripciones a avisar, anti-duplicados con `lastNotifiedFor`, rollover con `getNextBillingDate`, agrupación por usuario) + **tests unitarios completos**.
- [ ] Implementar `GET /api/cron/reminders` con verificación de `CRON_SECRET` (`timingSafeEqual`), envío por Resend y respuesta solo con contadores. Tests: 401 sin/mal token, no duplica en una segunda ejecución, omite usuarios sin email.
- [ ] Actualizar `proxy.ts` y `__tests__/route-access.test.ts`: excluir `/api/cron/*` del 401 de Clerk en lugar de `/api/webhooks/*`.
- [ ] Añadir `vercel.json` con un cron diario (una sola ejecución al día en Hobby) y plantilla del email en español.
- [ ] Sustituir `N8N_API_KEY` por `CRON_SECRET`, `RESEND_API_KEY` y `EMAIL_FROM` en `.env.example`, y documentar el flujo en `README.md`.

### Phase 5: Vercel Deployment & Production Hardening

- [ ] Configurar variables de entorno en Vercel y ejecutar migraciones en NeonDB.
- [ ] Configurar `CRON_SECRET`, `RESEND_API_KEY` y `EMAIL_FROM` en Vercel, verificar el dominio del remitente en Resend y validar un aviso real de extremo a extremo.

---

## 2. In Progress

- Documentación de la Fase 4 (Vercel Cron + Resend) en `chore/reminders-cron`. Siguiente: `feat/reminders-cron`.
- Pendiente de comprobar con servicios reales: probar la API contra Neon, el flujo de Clerk con claves reales y revisar visualmente la landing en el navegador.

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
- **Decidido, pendiente de implementar (Fase 4):** los avisos son para todos los usuarios, por email, con Vercel Cron + Resend. Se añadirá `email String?` a `UserSettings` (sincronizado desde Clerk). Detalle en `architecture-context.md` §3.
- Hobby de Vercel: cron como máximo diario, ±59 min de precisión y 300 s por ejecución. Pendiente confirmar los límites actuales de Resend (envíos/día y por segundo) antes de implementar; usar su envío por lotes si hace falta.
- Migración inicial (`20261117014434_init`) aplicada en el Neon de desarrollo. En producción (Fase 5) se aplica con `npx prisma migrate deploy`, no `migrate dev`.
- La CSP incluye dominios de Clerk de desarrollo (`*.clerk.accounts.dev`, `*.clerk.com`); al pasar a instancia de producción con dominio propio (`clerk.<tu-dominio>`) habrá que añadirlo (Fase 5).
- `ClerkProvider` va dentro de `<Suspense>` en `app/layout.tsx` por `cacheComponents`.
- `next.config.ts` trae opciones experimentales (`cacheComponents`, `partialPrefetching`, `agentFeedback`) heredadas del scaffold; revisar si se mantienen.
