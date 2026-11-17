# SubTracker

Aplicación web gratuita para llevar el control de tus suscripciones recurrentes. Apunta cada servicio, ve cuánto gastas al mes y al año y recibe un email antes de cada cobro para decidir si lo mantienes o lo cancelas.

La interfaz y la landing están en español. Cada usuario ve solo sus propios datos (arquitectura multiusuario aislada por `userId` de Clerk).

## Qué hace

- **Suscripciones (CRUD):** nombre, precio, divisa, ciclo (semanal, mensual, trimestral, anual), próximo cobro, días de antelación del aviso, categoría, estado (activa, pausada, cancelada), URL de cancelación y notas.
- **Dashboard:** gasto mensual y anual normalizados por divisa, reparto por categoría y línea de tiempo de los próximos cobros (7, 15 y 30 días).
- **Avisos por email:** un cron diario avisa a cada usuario de los cobros que caen dentro de su ventana de aviso, sin duplicar avisos, y avanza la fecha de los cobros ya pasados.
- **Landing pública (`/`)** con una demo del email de aviso, y páginas legales (`/privacidad`, `/aviso-legal`).

## Stack

| Capa | Tecnología |
| --- | --- |
| Framework | Next.js (App Router) + TypeScript estricto |
| API | Route Handlers REST en `app/api/**` (sin Server Actions) |
| Autenticación | Clerk |
| Base de datos | NeonDB (PostgreSQL serverless) con Prisma 7 |
| Validación | Zod |
| Interfaz | Tailwind CSS + shadcn/ui (base-ui) + SWR |
| Email | Resend |
| Tareas programadas | Vercel Cron |
| Tests | Vitest |

## Estructura

```
app/                 Páginas y Route Handlers
  api/subscriptions  CRUD de suscripciones (privado, requiere sesión)
  api/cron/reminders Job de avisos (protegido con CRON_SECRET)
components/          UI (dashboard, landing, ui/)
lib/                 Lógica pura y testeable
  billing.ts           normalización mensual/anual y próximo cobro
  reminders.ts         qué avisar, rollover, plantilla del email
  email.ts             envío con Resend
  validations/         esquemas Zod
prisma/              Esquema y migraciones
proxy.ts             Protección de rutas con Clerk
context/             Documentación de producto, arquitectura y progreso
__tests__/           Tests de Vitest
```

## Seguridad

- Todo endpoint privado comprueba la sesión (`401` sin `userId`) y filtra siempre por `{ id, userId }`; un recurso de otro usuario devuelve `404`.
- El `userId` nunca se acepta en el body, y los esquemas Zod rechazan campos desconocidos.
- `cancelUrl` solo admite `http:` y `https:`.
- El cron valida `Authorization: Bearer <CRON_SECRET>` con comparación en tiempo constante, y solo responde con contadores (nunca emails ni datos de usuarios).
- Cabeceras de seguridad y CSP básica en `next.config.ts`.

## Desarrollo local

Requisitos: Node 22+, una base de datos Neon y un proyecto de Clerk.

```bash
cp .env.example .env.local   # rellena las claves (ver tabla de variables)
npm install                  # postinstall ejecuta prisma generate
npx prisma migrate dev       # solo contra una base de desarrollo
npm run dev                  # http://localhost:3000
```

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Build y servidor de producción |
| `npm run test` | Tests (Vitest) |
| `npm run lint` | ESLint |

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | Cadena de conexión de Neon (`postgresql://...?sslmode=require`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | Claves de Clerk (`pk_test`/`sk_test` en desarrollo, `pk_live`/`sk_live` en producción) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-in` y `/sign-up` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | `/dashboard` |
| `CRON_SECRET` | Secreto aleatorio largo (`openssl rand -hex 32`); Vercel lo envía como `Authorization: Bearer` |
| `RESEND_API_KEY` | API key de Resend (`re_...`) |
| `EMAIL_FROM` | Remitente, p. ej. `SubTracker <avisos@tu-dominio.com>`. **El dominio debe estar verificado en Resend** (no sirve `gmail.com`) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Opcional: correo de contacto de las páginas legales |

Las variables `NEXT_PUBLIC_*` se incrustan en el build: si las cambias, hay que volver a desplegar.

## Avisos por email

Un cron diario de Vercel (`vercel.json`, `0 8 * * *` UTC) llama a `GET /api/cron/reminders`. En una sola pasada el job:

1. Selecciona las suscripciones activas cuyo cobro cae dentro de su ventana de aviso y que aún no se han avisado en ese ciclo (`lastNotifiedFor`).
2. Envía un email por usuario con Resend.
3. Marca la suscripción como avisada solo si el envío fue correcto, así una ejecución repetida o cortada no duplica avisos.
4. Avanza `nextBillingDate` de los cobros ya pasados.

El email de cada usuario se guarda en `UserSettings` la primera vez que abre el dashboard. Quien no lo haya hecho se omite.

En el plan Hobby de Vercel el cron corre como máximo una vez al día, con ±59 min de precisión.

Prueba manual:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/reminders
# {"rolledOver":0,"emailsSent":1,"emailsFailed":0,"subscriptionsNotified":1,"skippedNoEmail":0}
```

## Despliegue en producción (Vercel)

1. **Base de datos:** usa una base (o rama) de Neon de producción y aplica las migraciones con `migrate deploy`, nunca con `migrate dev`:
   ```bash
   DATABASE_URL="<cadena de producción>" npx prisma migrate deploy
   ```
2. **Clerk:** crea la instancia de producción (requiere dominio propio) y usa sus claves `live`. Si usas un dominio propio de Clerk (`clerk.<tu-dominio>`), añádelo a `clerkHosts` en `next.config.ts`.
3. **Resend:** añade y verifica tu dominio (registros SPF y DKIM en tu DNS) y crea una API key. Hasta que haya dominio verificado, `onboarding@resend.dev` solo puede enviar al email de tu propia cuenta de Resend.
4. **Vercel:** importa el repositorio, carga las variables de la tabla anterior en el entorno *Production* (sin comillas) y despliega `main`.
5. **Valida de extremo a extremo:**
   - Comprueba que el cron aparece registrado en el proyecto de Vercel.
   - Regístrate, abre el dashboard y crea una suscripción con cobro mañana.
   - Lanza el `curl` al cron en producción: debe llegarte el email.
   - Repítelo: no debe enviarse un segundo email.
   - Sin cabecera o con token erróneo debe devolver `401`.

## Flujo de trabajo

`feat/*`, `fix/*`, `chore/*` → PR a `dev` → PR a `main` (producción en Vercel). No se hacen commits de features directamente en `dev` ni en `main`. Más detalle en [`context/`](context/): visión de producto, arquitectura, reglas de trabajo, diseño y progreso.
