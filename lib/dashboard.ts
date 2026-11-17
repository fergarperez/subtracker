// Lógica pura del dashboard (sin I/O): KPIs, urgencia, filtros y formato.
import { toMonthly, toYearly, type BillingCycle } from "@/lib/billing";

export type SubscriptionStatus = "active" | "paused" | "cancelled";

/** Forma de una suscripción tal como la devuelve `/api/subscriptions`. */
export type Subscription = {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  reminderDays: number;
  category: string;
  status: SubscriptionStatus;
  cancelUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StatusFilter = "active" | "paused" | "all";
export type SortKey = "date" | "amount";
export type Urgency = "urgent" | "warning" | "safe" | "inactive";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** Totales por divisa (no se convierten divisas entre sí). */
export type CurrencyTotal = { currency: string; monthly: number; yearly: number };

export function computeTotals(subs: Subscription[]): CurrencyTotal[] {
  const map = new Map<string, CurrencyTotal>();
  for (const s of subs) {
    if (s.status !== "active") continue;
    const t = map.get(s.currency) ?? { currency: s.currency, monthly: 0, yearly: 0 };
    t.monthly += toMonthly(s.price, s.billingCycle);
    t.yearly += toYearly(s.price, s.billingCycle);
    map.set(s.currency, t);
  }
  return [...map.values()]
    .map((t) => ({ ...t, monthly: round2(t.monthly), yearly: round2(t.yearly) }))
    .sort((a, b) => b.monthly - a.monthly);
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Suscripciones activas con cobro >= `now`, ordenadas por fecha. */
export function upcomingCharges(subs: Subscription[], now: Date, days: number): Subscription[] {
  const limit = now.getTime() + days * DAY;
  return subs
    .filter((s) => {
      const t = Date.parse(s.nextBillingDate);
      return s.status === "active" && t >= now.getTime() && t <= limit;
    })
    .sort((a, b) => Date.parse(a.nextBillingDate) - Date.parse(b.nextBillingDate));
}

/** Próximo cobro activo (el más cercano en el futuro). */
export function nextCharge(subs: Subscription[], now: Date): Subscription | null {
  return upcomingCharges(subs, now, Number.POSITIVE_INFINITY)[0] ?? null;
}

/** < 48 h urgente, < 7 días aviso, resto seguro; pausadas/canceladas inactivas. */
export function getUrgency(s: Subscription, now: Date): Urgency {
  if (s.status !== "active") return "inactive";
  const diff = Date.parse(s.nextBillingDate) - now.getTime();
  if (diff < 48 * HOUR) return "urgent";
  if (diff < 7 * DAY) return "warning";
  return "safe";
}

/** Cuenta atrás legible en español. */
export function formatCountdown(iso: string, now: Date): string {
  const diff = Date.parse(iso) - now.getTime();
  if (diff < 0) return "Vencido";
  if (diff < HOUR) return "En menos de 1 h";
  if (diff < DAY) return `En ${Math.floor(diff / HOUR)} h`;
  const days = Math.floor(diff / DAY);
  return days === 1 ? "Mañana" : `En ${days} días`;
}

export function filterByStatus(subs: Subscription[], filter: StatusFilter): Subscription[] {
  return filter === "all" ? subs : subs.filter((s) => s.status === filter);
}

export function sortSubscriptions(subs: Subscription[], key: SortKey): Subscription[] {
  const copy = [...subs];
  if (key === "amount") {
    return copy.sort(
      (a, b) => toMonthly(b.price, b.billingCycle) - toMonthly(a.price, a.billingCycle),
    );
  }
  return copy.sort((a, b) => Date.parse(a.nextBillingDate) - Date.parse(b.nextBillingDate));
}

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export const CYCLE_LABELS: Record<BillingCycle, string> = {
  weekly: "Semanal",
  monthly: "Mensual",
  quarterly: "Trimestral",
  yearly: "Anual",
};

export const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: "Activa",
  paused: "Pausada",
  cancelled: "Cancelada",
};

export type CategoryShare = { category: string; monthly: number; share: number };

/** Gasto mensual por categoría en una divisa (solo activas), de mayor a menor. */
export function categoryBreakdown(subs: Subscription[], currency: string): CategoryShare[] {
  const map = new Map<string, number>();
  for (const s of subs) {
    if (s.status !== "active" || s.currency !== currency) continue;
    map.set(s.category, (map.get(s.category) ?? 0) + toMonthly(s.price, s.billingCycle));
  }
  const total = [...map.values()].reduce((a, b) => a + b, 0);
  if (total === 0) return [];
  return [...map.entries()]
    .map(([category, monthly]) => ({ category, monthly: round2(monthly), share: monthly / total }))
    .sort((a, b) => b.monthly - a.monthly);
}

/** Posición (0–1) de una fecha dentro de la ventana [now, now + days]. */
export function timelinePosition(iso: string, now: Date, days: number): number {
  const p = (Date.parse(iso) - now.getTime()) / (days * DAY);
  return Math.min(1, Math.max(0, p));
}

/** Tono estable (0–359) a partir de un texto, para avatares y categorías. */
export function hueFromText(text: string): number {
  let h = 0;
  for (const ch of text.toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}

/** Fila (0 o 1) de cada marcador: si queda muy cerca del anterior, sube a la otra fila. */
export function markerRows(positions: number[], minGap = 0.08): number[] {
  const rows: number[] = [];
  positions.forEach((pos, i) => {
    rows.push(i > 0 && pos - positions[i - 1] < minGap ? 1 - rows[i - 1] : 0);
  });
  return rows;
}
