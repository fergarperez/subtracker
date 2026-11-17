# Project Overview

## 1. Vision & Scope

Aplicación web open-source y gratuita para el seguimiento centralizado de suscripciones recurrentes. Diseñada originalmente como herramienta personal con arquitectura multiusuario aislada (tipo micro-SaaS), desplegada en la nube (Vercel + NeonDB) con avisos de renovación por email enviados por un cron de Vercel.

## 2. Core Goals

- **Visibilidad financiera inmediata:** Calcular cuánto dinero se destina a suscripciones al mes y al año (normalizando ciclos semanales, mensuales, trimestrales y anuales).
- **Control preventivo de cobros:** Recibir alertas automáticas antes de cada cargo para decidir si mantener o cancelar el servicio.
- **Arquitectura API-First & Open-Source:** Backend desacoplado basado en Route Handlers REST (`/api/*`), fácil de clonar, configurar con Clerk + NeonDB y desplegar en 1 clic en Vercel.

## 3. Target Audience

- **Principal:** usuarios finales con el mismo problema que el autor: pagan varias suscripciones y pierden la pista de cuánto gastan y cuándo se las cobran. La app es **gratuita para siempre**, y tanto la app como la landing están **en español**.
- **Secundaria:** desarrolladores que quieran clonar el proyecto (open-source). No es el foco de la comunicación ni de la landing.

## 4. Core Features (MVP)

- **Autenticación con Clerk:** Registro, inicio de sesión y gestión de sesión mediante Clerk, vinculando cada registro al `userId` de Clerk.
- **API REST & CRUD de Suscripciones:** Creación, lectura, edición, pausa y borrado de suscripciones mediante Route Handlers de Next.js (`/api/subscriptions`).
  - Campos: nombre, precio, divisa (`EUR`, `USD`, etc.), ciclo de facturación (`weekly`, `monthly`, `quarterly`, `yearly`), fecha de próximo cobro, días de antelación para aviso, categoría, estado (`active`, `paused`, `cancelled`), URL de cancelación y notas.
- **Dashboard Analítico:**
  - Gasto mensual total normalizado y proyección anual.
  - Desglose de gasto por categoría.
  - Lista cronológica de "Próximos cobros" (siguientes 7, 15 y 30 días).
- **Motor de Recordatorios (Vercel Cron + Resend, `/api/cron/reminders`):**
  - Un **Vercel Cron diario** llama a `GET /api/cron/reminders`, protegido con `CRON_SECRET`. No depende de ningún servidor propio ni de n8n.
  - **Es una función para todos los usuarios de la app**: avisa a cada usuario con suscripciones.
  - En una sola pasada el job (1) selecciona las suscripciones activas cuyo cobro está dentro de su ventana de aviso y aún no notificadas en el ciclo (`lastNotifiedFor`), (2) envía un email por Resend al dueño, (3) marca `lastNotifiedFor` y (4) avanza `nextBillingDate` de las que ya cobraron (rollover).
  - Canal: **email**, en español. El email de cada usuario se guarda en `UserSettings` (ver `architecture-context.md` §3) y nunca sale del servidor.
  - Límites del plan Hobby de Vercel: mínimo una ejecución al día, precisión de ±59 min sobre la hora programada y 300 s por ejecución. No se promete una hora exacta de aviso.
  - n8n queda descartado del núcleo. Solo se reconsiderará para canales extra (p. ej. Telegram) o automatizaciones futuras.
- **Landing Page Pública (`/`):**
  - **Sin redirección:** la landing es visible también con sesión iniciada; en ese caso el navbar muestra `Ir al dashboard` en lugar de los botones de acceso.
  - **Contenido:** Página de presentación minimalista con propuesta de valor clara, vista previa visual (mockup estático o interactivo con datos de ejemplo) del dashboard y CTAs hacia `/sign-up` ("Empezar gratis"). Orientada a usuarios finales: no menciona open source, GitHub ni n8n (detalle en `ui-context.md` §4).

## 5. User Flow Principal

1. **Acceso:** El visitante llega a la landing (`/`), se registra o inicia sesión con Clerk y entra a su dashboard privado. Con sesión activa, la landing sigue visible y ofrece un acceso directo al dashboard.
2. **Alta de suscripción:** El usuario registra una suscripción desde el cliente web (`POST /api/subscriptions`).
3. **Consulta:** El dashboard consume `GET /api/subscriptions` y renderiza el gasto mensual normalizado y los vencimientos inminentes.
4. **Alerta automatizada (Vercel Cron):** Cada día, a primera hora de la mañana (UTC, con margen de hasta 59 min), Vercel llama a `GET /api/cron/reminders`. Si una suscripción está dentro de su ventana de aviso, la app envía un email al dueño con Resend, marca la suscripción como notificada y avanza las fechas de los cobros ya pasados.
