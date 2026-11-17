# UI & Design System Context

## 1. Aesthetic Direction (rediseño 2026-11-17)

- **Estilo:** dashboard financiero cálido y claro, sin ruido. El elemento memorable es la **línea de tiempo de cobros** ("Netflix te cobra mañana" + marcadores sobre una escala de 7/15/30 días); el resto es discreto.
- **Tema:** Dark Mode por defecto ("medianoche" azulada), sin modo claro por ahora.
- **Movimiento:** solo los marcadores de la línea de tiempo entran escalonados al cargar; el resto son transiciones de respuesta a acciones. Respeta `prefers-reduced-motion`.

## 2. Color Palette (tokens en `app/globals.css`, clase `.dark`)

- **Fondo:** `#0A0D1A` · **Superficie/cards:** `#121730` · **Elevado (`surface`):** `#1A2040` · **Borde:** `#262E52`
- **Texto:** `#EEF0FA` · **Secundario:** `#8D96B8`
- **Acento primario (CTAs, foco):** lila `#9B8CFF` (texto sobre él `#12093A`)
- **Semánticos:** `safe` `#4ADE9A` (> 7 días), `warn` `#F5B544` (< 7 días), `urgent` `#FF6B81` (< 48 h); pausada/cancelada en `muted-foreground`.
- Avatares y categorías usan un tono OKLCH estable derivado del nombre (`hueFromText`).

## 3. Typography & Data Display

- **Títulos y cifras:** Bricolage Grotesque (`font-display`, aplicado a `h1–h3`). **Interfaz:** Figtree.
- Cifras monetarias con clase `.tnum` (`tabular-nums`). Ya no se usa fuente monoespaciada.

## 4. Idioma y landing

- **Idioma:** toda la interfaz (app y landing) en **español**.

Landing Page (`/`)

- **Estructura limpia (sin scroll infinito ni relleno comercial):**
  1. **Navbar (sticky):** `BrandLogo` a la izquierda; `Iniciar sesión` y `Empezar gratis` a la derecha (con sesión, `Ir al dashboard`).
  2. **Hero en dos columnas (texto alineado a la izquierda):**
     - Badge sutil: `Gratis para siempre`.
     - Titular: _"Que ningún cobro te pille por sorpresa."_
     - Subtítulo breve: apuntar suscripciones, gasto mensual/anual y email antes de cada cobro.
     - Dos CTAs: primario lila (`primary`) hacia `/sign-up` y secundario que desplaza a la vista previa.
     - A la derecha, `ProductPreview`: maqueta estática que replica la línea de tiempo del dashboard con datos de ejemplo.
  3. **3 ventajas en columnas** (icono + título + texto, sin tarjetas): cuánto gastas de verdad, un aviso antes de cada cobro, gratis y solo tuya.
  4. **Footer minimalista:** crédito del autor.
- **Sin mención a open source, GitHub ni n8n:** la landing habla solo de producto y beneficio para el usuario final.

## 5. Component Library & Layout

- **Librería base:** `shadcn/ui` (con `@base-ui/react`) + `Lucide React`.
- **Fetching:** `fetch` tipado hacia `/api/*` con `SWR` (caché, revalidación y estados de carga/error).
- **Copy:** acciones con el mismo nombre en todo el flujo (botón `Eliminar` → aviso `Suscripción eliminada`). Los errores explican qué pasó y cómo seguir; los vacíos invitan a actuar.
- **Layout:**
  - **Header (sticky, `backdrop-blur`):** `BrandLogo` y `<UserButton />` de Clerk.
  - **Dashboard (`max-w-6xl mx-auto`):**
    1. **Cabecera de página:** título `Tus suscripciones` y botón primario `Nueva suscripción`.
    2. **Fila principal** (`lg:grid-cols-[1.6fr_1fr]`):
       - `Upcoming`: frase del próximo cobro + importe, selector 7/15/30 días, **línea de tiempo** con marcadores por urgencia y tarjetas de los cobros con `cancelUrl` (`rel="noopener noreferrer"`).
       - `Summary`: gasto mensual y anual por divisa y barra de reparto por categoría (divisa principal).
    3. **Listado:** filtro segmentado (`Activas`, `Pausadas`, `Todas`), orden por fecha o importe, filas con `Avatar`, `UrgencyBadge` e importe; acciones pausar/editar/eliminar visibles al pasar el ratón (siempre visibles en móvil).
  - **Estados:** esqueletos al cargar, pantalla de bienvenida sin suscripciones, estado vacío por filtro, confirmación de borrado en modal y aviso breve tras cada acción.
- **Componentes propios:** `components/brand-logo.tsx`, `components/dashboard/{dashboard,upcoming,summary,subscription-list,subscription-form,avatar,urgency-badge}.tsx`, `components/landing/product-preview.tsx`.
