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
  1. **Navbar:** Logo a la izquierda; botones `Iniciar sesión` y `Empezar gratis` a la derecha.
  2. **Hero Section:**
     - Badge superior sutil: `Gratis para siempre`.
     - Titular directo: _"Controla tus suscripciones antes de que te las cobren."_
     - Subtítulo breve explicando el cálculo mensual/anual y los avisos por email antes de cada cobro.
     - Dos CTAs: primario en verde (`emerald-500`) hacia `/sign-up` y secundario (`zinc-800`) que desplaza a la vista previa del producto.
  3. **Product Preview:** Tarjeta con borde `zinc-800` mostrando una maqueta visual realista del dashboard en Dark Mode (KPIs + lista de próximos cobros con badges de urgencia).
  4. **3 Feature Cards (Grid 3 columnas):**
     - _Cálculo real mensual y anual_ (normalización de ciclos).
     - _Avisos antes de cada cobro_ (te escribimos por email con antelación).
     - _Gratis y privada_ (sin coste y tus datos son solo tuyos).
  5. **Footer minimalista:** crédito del autor.
- **Sin mención a open source, GitHub ni n8n:** la landing habla solo de producto y beneficio para el usuario final.

## 5. Component Library & Layout

- **Librería base:** `shadcn/ui` + `Lucide React`.
- **Gestión de estado cliente / fetching:** `fetch` tipado hacia `/api/*` (con `TanStack Query` o `SWR` para caché, revalidación automática y estados de carga/error limpios).
- **Layout:**
  - **Header:** Logo + nombre de la app, botón primario `+ Nueva Suscripción`, y `<UserButton />` de Clerk.
  - **Dashboard View (`max-w-6xl mx-auto`):**
    1. **KPI Row (3 tarjetas):** Gasto Mensual Normalizado, Gasto Anual Proyectado, Próximo Cobro (importe + cuenta atrás).
    2. **Próximos Vencimientos:** Tarjetas destacadas con badges de urgencia y acceso directo a `cancelUrl` (con `rel="noopener noreferrer"`).
    3. **Listado de Suscripciones:** Filtrable por estado (`Activas`, `Pausadas`, `Todas`) y ordenable por fecha de cobro o importe. Responsive en móvil (vista tarjetas).
