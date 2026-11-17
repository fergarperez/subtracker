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
