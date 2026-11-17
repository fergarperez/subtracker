# SubTracker

Seguimiento de suscripciones recurrentes: gasto mensual/anual, próximos cobros y aviso por email antes de cada cargo. Next.js (App Router) + Clerk + NeonDB (Prisma) + Resend, desplegado en Vercel.

## Desarrollo local

```bash
cp .env.example .env.local   # rellena las claves
npm install                  # postinstall ejecuta prisma generate
npx prisma migrate dev       # solo en la base de datos de desarrollo
npm run dev
npm run test
```

## Avisos por email (Vercel Cron + Resend)

Un cron diario de Vercel (`vercel.json`, `0 8 * * *` UTC) llama a `GET /api/cron/reminders`, que avanza los cobros pasados y envía por Resend un email a cada usuario con cobros próximos. En el plan Hobby la hora tiene una precisión de ±59 min.

Prueba local:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/reminders
```

## Despliegue en producción (Vercel)

### 1. Base de datos (Neon)

Usa una base de datos (o branch) de producción distinta de la de desarrollo. Aplica las migraciones **con `migrate deploy`** (nunca `migrate dev`) apuntando a ella:

```bash
DATABASE_URL="<cadena de producción>" npx prisma migrate deploy
```

### 2. Clerk

Crea la instancia de **producción** (requiere dominio propio) y copia sus claves `pk_live_...` / `sk_live_...`. Si Clerk usa un dominio propio (`clerk.<tu-dominio>`), añádelo a `clerkHosts` en `next.config.ts`.

### 3. Resend

Verifica el dominio del remitente (registros SPF/DKIM en tu DNS) y crea una API key. `EMAIL_FROM` debe usar ese dominio.

### 4. Variables de entorno en Vercel (Production)

| Variable | Valor |
| --- | --- |
| `DATABASE_URL` | Cadena de Neon de producción |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | Claves `live` de Clerk |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `..._SIGN_UP_URL`, `..._FALLBACK_REDIRECT_URL` | Como en `.env.example` |
| `CRON_SECRET` | Cadena aleatoria larga (`openssl rand -hex 32`); Vercel la envía como `Authorization: Bearer` |
| `RESEND_API_KEY` | `re_...` |
| `EMAIL_FROM` | `SubTracker <avisos@tu-dominio.com>` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Opcional: contacto de las páginas legales |

### 5. Validar de extremo a extremo

1. Despliega `main` y comprueba que `vercel.json` registró el cron (Vercel → Settings → Cron Jobs).
2. Regístrate, abre el dashboard (guarda tu email) y crea una suscripción con cobro mañana.
3. Lanza el job a mano: `curl -H "Authorization: Bearer <CRON_SECRET>" https://<tu-dominio>/api/cron/reminders` → debe responder solo con contadores y llegarte el email.
4. Repítelo: no debe enviarse un segundo email (`lastNotifiedFor`).
5. Sin cabecera o con token erróneo debe devolver `401`.
