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
- **Landing (`/`):** pública, mismo dark mode y paleta que la app. Dirigida a usuarios finales, tono de beneficio y sin jerga técnica. Secciones: (1) Hero con el problema y la promesa + CTA a `/sign-up`; (2) Cómo funciona en 3 pasos (añade tus suscripciones, mira tu gasto, recibe un aviso antes del cobro); (3) Vista previa del dashboard y de los avisos; (4) CTA final y pie de página. Se diseña tras la Fase 3, con capturas reales. Mensaje clave: gratis para siempre.
- Hasta entonces, `/` redirige a `/sign-in` o al dashboard según haya sesión.

## 5. Component Library & Layout

- **Librería base:** `shadcn/ui` + `Lucide React`.
- **Gestión de estado cliente / fetching:** `fetch` tipado hacia `/api/*` (con `TanStack Query` o `SWR` para caché, revalidación automática y estados de carga/error limpios).
- **Layout:**
  - **Header:** Logo + nombre de la app, botón primario `+ Nueva Suscripción`, y `<UserButton />` de Clerk.
  - **Dashboard View (`max-w-6xl mx-auto`):**
    1. **KPI Row (3 tarjetas):** Gasto Mensual Normalizado, Gasto Anual Proyectado, Próximo Cobro (importe + cuenta atrás).
    2. **Próximos Vencimientos:** Tarjetas destacadas con badges de urgencia y acceso directo a `cancelUrl` (con `rel="noopener noreferrer"`).
    3. **Listado de Suscripciones:** Filtrable por estado (`Activas`, `Pausadas`, `Todas`) y ordenable por fecha de cobro o importe. Responsive en móvil (vista tarjetas).
