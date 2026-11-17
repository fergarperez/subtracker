# UI & Design System Context

## 1. Aesthetic Direction

- **Estilo:** Minimalismo funcional tipo dashboard financiero moderno (inspiración en Linear y Raycast). Alta claridad visual, tipografía tabular para cifras monetarias y cero elementos superfluos.
- **Tema:** **Dark Mode por defecto** (con soporte opcional para Light Mode mediante variables CSS de Tailwind / shadcn).

## 2. Color Palette (Tailwind / CSS Variables)

- **Background Principal:** `#09090B` (`zinc-950`)
- **Surface / Cards:** `#121215` o `#18181B` (`zinc-900`) con borde sutil `#27272A` (`zinc-800`, `1px solid`).
- **Primary Accent (Acciones principales / CTAs):** `#10B981` (`emerald-500`) — hover en `#059669` (`emerald-600`).
- **Text Primary:** `#FAFAFA` (`zinc-50`)
- **Text Secondary / Muted:** `#A1A1AA` (`zinc-400`)
- **Semantic Status Colors:**
  - **Active / Safe:** `#10B981` (`emerald-500`)
  - **Upcoming Renewal (< 7 días / Warning):** `#F59E0B` (`amber-500`)
  - **Imminent Charge (< 48h / Urgent):** `#EF4444` (`red-500`)
  - **Paused / Cancelled:** `#71717A` (`zinc-500`)

## 3. Typography & Data Display

- **Fuente UI:** `Inter` o `Geist Sans`.
- **Fuente Monospace (precios, fechas y contadores):** `JetBrains Mono` o `Geist Mono` con `tabular-nums` obligatorio en cifras y tablas.

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
