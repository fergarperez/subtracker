# Project Progress Tracker

**Current Phase:** Phase 4 implementada (Vercel Cron + Resend), pendiente de PR a `dev`; fases 0 a 3.5 fusionadas en `dev`
**Active Branch:** `feat/landing-demo-legal` (flujo: `feat/*` → `dev` → `main`)
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

- [x] Añadir `email` a `UserSettings` (schema + migración; quitar de paso la línea `url = env(...)` del bloque `generator`, que Prisma 7 ignora), con `upsert` desde Clerk en la primera petición autenticada.
- [x] Implementar `lib/reminders.ts` (selección de suscripciones a avisar, anti-duplicados con `lastNotifiedFor`, rollover con `getNextBillingDate`, agrupación por usuario) + **tests unitarios completos**.
- [x] Implementar `GET /api/cron/reminders` con verificación de `CRON_SECRET` (`timingSafeEqual`), envío por Resend y respuesta solo con contadores. Tests: 401 sin/mal token, no duplica en una segunda ejecución, omite usuarios sin email.
- [x] Actualizar `proxy.ts` y `__tests__/route-access.test.ts`: excluir `/api/cron/*` del 401 de Clerk en lugar de `/api/webhooks/*`.
- [x] Añadir `vercel.json` con un cron diario (una sola ejecución al día en Hobby) y plantilla del email en español.
- [x] Sustituir `N8N_API_KEY` por `CRON_SECRET`, `RESEND_API_KEY` y `EMAIL_FROM` en `.env.example`, y documentar el flujo en `README.md`.

### Phase 4.5: Rediseño de la interfaz

- [x] Nuevo sistema visual (paleta, tipografías, tokens) y `ui-context.md` actualizado.
- [x] Dashboard: frase + línea de tiempo de próximos cobros, resumen con desglose por categoría, lista con avatares, estado vacío/onboarding, skeletons, confirmación de borrado en modal y avisos de acción. Botón `Nueva suscripción` en la cabecera de la página.
- [x] Landing en dos columnas con maqueta que replica el nuevo dashboard.
- [x] Revisión visual en el navegador y de las pantallas de Clerk.

### Phase 4.6: Demo de aviso en la landing + footer + páginas legales

Decisiones (2026-11-17): la demo es un **email de ejemplo en pantalla** (sin enviar nada ni pedir datos); el footer lleva marca, navegación y enlaces legales.

- [x] Extraer de `lib/reminders.ts` el contenido del email a una función pura reutilizable (`buildReminderEmail` ya devuelve asunto/HTML/texto) y usarla con datos de ejemplo fijos en la demo, para que landing y email real no diverjan. + tests.
- [x] Componente cliente `ReminderDemo` en la landing: botón `Ver un aviso de ejemplo` → bandeja ficticia donde llega el email (animación de entrada, `prefers-reduced-motion` respetado), con el texto real del aviso y botón `Repetir`. Sin llamadas a la API ni a Clerk.
- [x] Footer nuevo: `BrandLogo` + frase, columnas de navegación (`Cómo funciona`, `Empezar gratis`, `Iniciar sesión`) y legales (`Privacidad`, `Aviso legal y cookies`), crédito del autor. Responsive.
- [x] Páginas `/privacidad` y `/aviso-legal` (estáticas, en español): qué datos se guardan (email y suscripciones), para qué, proveedores (Clerk, Neon, Resend, Vercel), cómo borrarlos. Excluirlas de la protección en `proxy.ts` si procede y actualizar `route-access`.
- [x] Actualizar `ui-context.md` (§4 landing y footer).

### Phase 5: Vercel Deployment & Production Hardening

- [ ] Configurar variables de entorno en Vercel y ejecutar migraciones en NeonDB.
- [ ] Configurar `CRON_SECRET`, `RESEND_API_KEY` y `EMAIL_FROM` en Vercel, verificar el dominio del remitente en Resend y validar un aviso real de extremo a extremo.

---

## 2. In Progress

- Fase 4 implementada en `feat/reminders-cron`; falta PR → `dev`. Siguiente: Fase 5.
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
- Fase 4: `email` en `UserSettings` (migración `add_user_email` aplicada en Neon dev), `lib/user-settings.ts` (`syncUserEmail`, llamado en `GET /api/subscriptions`; consulta a Clerk si no hay email o tiene >24 h), `lib/reminders.ts`, `lib/cron-auth.ts` (`timingSafeEqual` sobre hash SHA-256), `lib/email.ts` (Resend batch vía `fetch`, sin dependencia nueva), `app/api/cron/reminders/route.ts`, `vercel.json` (cron `0 7 * * *`), `.env.example`. `proxy.ts` no cambia: usa `lib/route-access.ts`, que ahora excluye `/api/cron/*`. Tests: `reminders.test.ts`, `cron-reminders.test.ts`; `route-access.test.ts` actualizado. Total: 74 tests.
- Fase 4.6: `buildDemoReminders` (`lib/reminders.ts`), `components/landing/{reminder-demo,site-footer}.tsx`, páginas `/privacidad` y `/aviso-legal` en `app/(legal)`, `lib/legal.ts`. `proxy.ts` no cambia (son públicas). Tests: demo en `reminders.test.ts` y rutas públicas en `route-access.test.ts`. Total: 82 tests. Pendiente: revisión visual en navegador y fijar `NEXT_PUBLIC_CONTACT_EMAIL`.
- Rediseño: `lib/dashboard.ts` (+`categoryBreakdown`, `timelinePosition`, `markerRows`, `hueFromText`), componentes `brand-logo`, `avatar`, `summary`, `upcoming` (línea de tiempo). Se eliminó `kpi-cards`. Total: 79 tests.
- Repo: `master` renombrada a `main`; creada `dev`; publicado en GitHub (`fergarperez/subtracker`). PR #1 (Fase 0), #2 (des-trackeo del cliente Prisma generado) y #3 (contexto de producto) fusionadas.

## 4. Known Issues / Technical Debt

- Dashboard: los totales se muestran por divisa (sin conversión) y el desglose por categoría usa la divisa con más gasto. Sin tests de componentes (solo lógica pura).
- Avisos (Fase 4): usuarios que no han abierto el dashboard desde la migración no tienen `email` y se omiten hasta que lo hagan. Si Resend falla, el lote no se marca y se reintenta al día siguiente. El envío de un lote es atómico (todo o nada).
- Hobby de Vercel: cron como máximo diario, ±59 min de precisión y 300 s por ejecución. Pendiente confirmar los límites actuales de Resend (envíos/día y por segundo) antes de implementar; usar su envío por lotes si hace falta.
- Migración inicial (`20261117014434_init`) aplicada en el Neon de desarrollo. En producción (Fase 5) se aplica con `npx prisma migrate deploy`, no `migrate dev`.
- La CSP incluye dominios de Clerk de desarrollo (`*.clerk.accounts.dev`, `*.clerk.com`); al pasar a instancia de producción con dominio propio (`clerk.<tu-dominio>`) habrá que añadirlo (Fase 5).
- `ClerkProvider` va dentro de `<Suspense>` en `app/layout.tsx` por `cacheComponents`.
- `next.config.ts` trae opciones experimentales (`cacheComponents`, `partialPrefetching`, `agentFeedback`) heredadas del scaffold; revisar si se mantienen.
