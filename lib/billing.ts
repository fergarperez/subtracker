// Utilidades puras de facturación (sin I/O). Fechas en UTC.

export const BILLING_CYCLES = ["weekly", "monthly", "quarterly", "yearly"] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Gasto mensual equivalente de un cobro con el ciclo dado. */
export function toMonthly(price: number, cycle: BillingCycle): number {
  switch (cycle) {
    case "weekly":
      return round2((price * 52) / 12);
    case "monthly":
      return round2(price);
    case "quarterly":
      return round2(price / 3);
    case "yearly":
      return round2(price / 12);
  }
}

/** Gasto anual equivalente de un cobro con el ciclo dado. */
export function toYearly(price: number, cycle: BillingCycle): number {
  switch (cycle) {
    case "weekly":
      return round2(price * 52);
    case "monthly":
      return round2(price * 12);
    case "quarterly":
      return round2(price * 4);
    case "yearly":
      return round2(price);
  }
}

/** Suma `n` ciclos a `anchor`; los meses se ajustan al último día (31 ene + 1 mes = 28/29 feb). */
export function addCycles(anchor: Date, cycle: BillingCycle, n: number): Date {
  if (cycle === "weekly") {
    return new Date(anchor.getTime() + n * 7 * 24 * 60 * 60 * 1000);
  }
  const months = n * (cycle === "monthly" ? 1 : cycle === "quarterly" ? 3 : 12);
  const total = anchor.getUTCFullYear() * 12 + anchor.getUTCMonth() + months;
  const year = Math.floor(total / 12);
  const month = ((total % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const day = Math.min(anchor.getUTCDate(), lastDay);
  return new Date(
    Date.UTC(
      year,
      month,
      day,
      anchor.getUTCHours(),
      anchor.getUTCMinutes(),
      anchor.getUTCSeconds(),
      anchor.getUTCMilliseconds(),
    ),
  );
}

/**
 * Próxima fecha de cobro estrictamente posterior a `from`, avanzando ciclos desde
 * `current`. Si `current` ya es posterior a `from`, se devuelve tal cual.
 * Se calcula siempre desde el ancla original para no acumular el recorte de fin de mes.
 */
export function getNextBillingDate(
  current: Date,
  cycle: BillingCycle,
  from: Date = new Date(),
): Date {
  if (current.getTime() > from.getTime()) return new Date(current);
  let n = 1;
  let next = addCycles(current, cycle, n);
  while (next.getTime() <= from.getTime()) {
    n += 1;
    next = addCycles(current, cycle, n);
  }
  return next;
}
