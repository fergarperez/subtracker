import {
  computeTotals,
  formatCountdown,
  formatMoney,
  nextCharge,
  type Subscription,
} from "@/lib/dashboard";

function Kpi({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="mt-2 space-y-1">{children}</div>
    </div>
  );
}

const value = "font-mono text-2xl font-semibold tabular-nums";

export function KpiCards({ subs, now }: { subs: Subscription[]; now: Date }) {
  const totals = computeTotals(subs);
  const next = nextCharge(subs, now);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Kpi label="Gasto mensual">
        {totals.length === 0 ? (
          <p className={value}>—</p>
        ) : (
          totals.map((t) => (
            <p key={t.currency} className={value}>
              {formatMoney(t.monthly, t.currency)}
            </p>
          ))
        )}
      </Kpi>
      <Kpi label="Gasto anual proyectado">
        {totals.length === 0 ? (
          <p className={value}>—</p>
        ) : (
          totals.map((t) => (
            <p key={t.currency} className={value}>
              {formatMoney(t.yearly, t.currency)}
            </p>
          ))
        )}
      </Kpi>
      <Kpi label="Próximo cobro">
        {next ? (
          <>
            <p className={value}>{formatMoney(next.price, next.currency)}</p>
            <p className="text-sm text-muted-foreground">
              {next.name} · {formatCountdown(next.nextBillingDate, now)}
            </p>
          </>
        ) : (
          <p className={value}>—</p>
        )}
      </Kpi>
    </div>
  );
}
