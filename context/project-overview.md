# Project Overview

## 1. Vision & Scope

Aplicación web open-source y gratuita para el seguimiento centralizado de suscripciones recurrentes. Diseñada originalmente como herramienta personal con arquitectura multiusuario aislada (tipo micro-SaaS), desplegada en la nube (Vercel + NeonDB) y conectada a una instancia privada de n8n para automatizar los avisos de renovación.

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
- **Motor de Recordatorios vía n8n (`/api/webhooks/reminders`):**
  - Endpoint seguro consultado diariamente por la instancia privada de **n8n** del autor.
  - **Es una función para todos los usuarios de la app**, no solo para el autor: n8n avisa a cada usuario con suscripciones.
  - Devuelve las suscripciones activas próximas a vencer que aún no han sido notificadas en el ciclo actual, y expone un endpoint de confirmación (`ack`) y avance automático de fechas (`rollover`).
  - Decisión pendiente: canal y dato de contacto por usuario (ver `progress-tracker.md`, sección 4).
- **Landing pública (`/`):** explica a usuarios finales qué es la app y qué se van a encontrar (problema, cómo funciona, vista previa del dashboard y de los avisos, CTA a `/sign-up`). Lenguaje de beneficio, sin jerga técnica. Se implementa tras la Fase 3 (ver `progress-tracker.md`).

## 5. User Flow Principal

1. **Acceso:** El visitante llega a la landing (`/`), se registra o inicia sesión con Clerk y entra a su dashboard privado. Con sesión activa, `/` redirige al dashboard.
2. **Alta de suscripción:** El usuario registra una suscripción desde el cliente web (`POST /api/subscriptions`).
3. **Consulta:** El dashboard consume `GET /api/subscriptions` y renderiza el gasto mensual normalizado y los vencimientos inminentes.
4. **Alerta automatizada (n8n):** Cada día a las 09:00, el workflow en tu VPS con n8n hace `GET /api/webhooks/reminders` a Vercel. Si detecta un cobro próximo, envía una notificación al usuario dueño de la suscripción (canal por decidir; email es el candidato) y confirma el envío con `POST /api/webhooks/reminders/ack`.
