# AI Development & Workflow Rules

Estas reglas son de obligado cumplimiento para cualquier asistente de IA que genere o modifique código en este repositorio.

## 1. Git & Branching Strategy

- **`main`:** Rama de producción conectada directamente a Vercel. Siempre estable. Prohibido hacer commits directos de features sobre `main`.
- **`dev`:** Rama de integración donde se mergean y validan las features antes de pasar a producción.
- **Feature Branches:** Toda tarea nueva debe desarrollarse en una rama aislada:
  - `feat/<nombre-corto>` (ej. `feat/subscriptions-api`, `feat/n8n-webhook`)
  - `fix/<nombre-corto>` (ej. `fix/date-rollover-timezone`)
  - `test/<nombre-corto>` (ej. `test/billing-calculations`)
  - `chore/<nombre-corto>` (ej. `chore/security-headers`)

## 2. Regla de "Una Feature por Iteración"

- **Alcance estricto:** Implementar **únicamente** la funcionalidad solicitada en el prompt actual. No introducir librerías ni refactors fuera de alcance.
- **Vertical Slicing:** Entregar cada funcionalidad completa (esquema DB -> validación Zod -> Route Handler `/api/*` -> tests -> UI) antes de avanzar.
- **Sin Server Actions:** Toda mutación o consulta desde cliente debe pasar exclusivamente por los Route Handlers en `src/app/api/**`.

## 3. Estándares de Seguridad (Obligatorios)

- **Autenticación en cada endpoint:** Todo Route Handler privado debe verificar la identidad con `auth()` de `@clerk/nextjs/server` al inicio y devolver `401 Unauthorized` si no hay `userId`.
- **Aislamiento de datos (IDOR Prevention):** En operaciones `GET`, `PATCH` y `DELETE` sobre un recurso individual (`/api/subscriptions/[id]`), filtrar siempre por `where: { id, userId }`. Nunca confiar en un `userId` enviado en el body del request.
- **Protección de Webhooks n8n:** Los endpoints bajo `/api/webhooks/*` deben validar la cabecera `Authorization: Bearer <N8N_API_KEY>` usando comparación segura en tiempo constante (`crypto.timingSafeEqual`) para evitar timing attacks.
- **Validación estricta:** Validar `body`, `query params` y `route params` con **Zod** antes de tocar la base de datos. Sanitizar strings de texto libre y validar que `cancelUrl` solo acepte protocolos `http:` o `https:` (prevenir XSS vía `javascript:`).
- **Rate Limiting & Headers:** Configurar cabeceras de seguridad HTTP (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, CSP básica) en `next.config.ts` y aplicar rate limiting en endpoints públicos/webhooks.

## 4. Testing Obligatorio

- **Tests Unitarios y de Integración (`Vitest`):** Toda lógica de negocio pura (cálculo de gasto mensual/anual, cálculo de `nextBillingDate`, validación Zod) y los Route Handlers críticos deben incluir tests en `__tests__/` o `*.test.ts`.
- Ninguna PR hacia `dev` o `main` se da por cerrada si `npm run test` falla.

## 5. Mantenimiento de Documentación

- Al terminar cada feature o fix, actualizar **`context/progress-tracker.md`** reflejando lo completado, lo que está en curso y los nuevos tests añadidos.
- Si cambian modelos de Prisma, endpoints de API o variables de entorno, actualizar **`context/architecture-context.md`** en el mismo commit.
