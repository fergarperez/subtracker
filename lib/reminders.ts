// Lógica pura de recordatorios (sin I/O). Fechas en UTC.
import { getNextBillingDate, type BillingCycle } from "@/lib/billing";

const DAY_MS = 24 * 60 * 60 * 1000;

export type ReminderSubscription = {
  id: string;
  userId: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  nextBillingDate: Date;
  reminderDays: number;
  lastNotifiedFor: Date | null;
  status: string;
  cancelUrl: string | null;
};

export type Rollover = { id: string; nextBillingDate: Date };

export type DueReminder = {
  id: string;
  name: string;
  price: number;
  currency: string;
  /** Fecha del cobro que se avisa (ya con rollover aplicado). */
  billingDate: Date;
  cancelUrl: string | null;
};

export type ReminderPlan = {
  /** Suscripciones activas cuyo cobro ya pasó: hay que avanzar `nextBillingDate`. */
  rollovers: Rollover[];
  /** Avisos pendientes agrupados por usuario. */
  byUser: Map<string, DueReminder[]>;
};

/**
 * Decide qué hacer en una ejecución del cron:
 * - Solo `status = active`.
 * - Si el cobro ya pasó (`nextBillingDate <= now`) se avanza con `getNextBillingDate`
 *   (no se avisa de un cobro pasado).
 * - Se avisa si `now >= fecha - reminderDays` y `lastNotifiedFor` no es esa fecha.
 */
export function planReminders(subs: ReminderSubscription[], now: Date): ReminderPlan {
  const rollovers: Rollover[] = [];
  const byUser = new Map<string, DueReminder[]>();

  for (const s of subs) {
    if (s.status !== "active") continue;

    let billingDate = s.nextBillingDate;
    if (billingDate.getTime() <= now.getTime()) {
      billingDate = getNextBillingDate(s.nextBillingDate, s.billingCycle, now);
      rollovers.push({ id: s.id, nextBillingDate: billingDate });
    }

    const windowStart = billingDate.getTime() - s.reminderDays * DAY_MS;
    if (now.getTime() < windowStart) continue;
    if (s.lastNotifiedFor && s.lastNotifiedFor.getTime() === billingDate.getTime()) continue;

    const list = byUser.get(s.userId) ?? [];
    list.push({
      id: s.id,
      name: s.name,
      price: s.price,
      currency: s.currency,
      billingDate,
      cancelUrl: s.cancelUrl,
    });
    byUser.set(s.userId, list);
  }

  for (const list of byUser.values()) {
    list.sort((a, b) => a.billingDate.getTime() - b.billingDate.getTime());
  }
  return { rollovers, byUser };
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const formatDate = (d: Date) =>
  new Intl.DateTimeFormat("es-ES", { dateStyle: "long", timeZone: "UTC" }).format(d);

const formatMoney = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
};

/** Plantilla del email (español) para los avisos de un usuario. */
export function buildReminderEmail(items: DueReminder[]): {
  subject: string;
  html: string;
  text: string;
} {
  const subject =
    items.length === 1
      ? `Próximo cobro: ${items[0].name}`
      : `Tienes ${items.length} cobros próximos`;

  const lines = items.map(
    (i) => `${i.name} — ${formatMoney(i.price, i.currency)} el ${formatDate(i.billingDate)}`,
  );
  const text = `Hola,\n\nEstos cobros se acercan:\n\n${lines.map((l) => `- ${l}`).join("\n")}\n\nSi no quieres seguir con alguno, cancélalo antes de la fecha.`;

  const rows = items
    .map((i) => {
      const cancel =
        i.cancelUrl && /^https?:\/\//i.test(i.cancelUrl)
          ? ` · <a href="${escapeHtml(i.cancelUrl)}" rel="noopener noreferrer">Cancelar</a>`
          : "";
      return `<li><strong>${escapeHtml(i.name)}</strong> — ${escapeHtml(formatMoney(i.price, i.currency))} el ${escapeHtml(formatDate(i.billingDate))}${cancel}</li>`;
    })
    .join("");
  const html = `<div style="font-family:system-ui,sans-serif"><p>Hola,</p><p>Estos cobros se acercan:</p><ul>${rows}</ul><p>Si no quieres seguir con alguno, cancélalo antes de la fecha.</p></div>`;

  return { subject, html, text };
}
