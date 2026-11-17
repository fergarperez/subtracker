import {
  categoryBreakdown,
  computeTotals,
  formatMoney,
  hueFromText,
  type Subscription,
} from "@/lib/dashboard";

const catColor = (name: string) => `oklch(0.72 0.14 ${hueFromText(name)})`;

/** Gasto mensual y anual, con el reparto por categoría de la divisa principal. */
export function Summary({ subs }: { subs: Subscription[] }) {
  const totals = computeTotals(subs);
  const main = totals[0];
  const cats = main ? categoryBreakdown(subs, main.currency) : [];

  return (
    <section aria-label="Resumen de gasto" className="rounded-2xl border border-border bg-card p-6">
      <p className="text-sm text-muted-foreground">Gastas al mes</p>
      {totals.length === 0 ? (
        <p className="mt-1 font-display text-4xl font-semibold">—</p>
      ) : (
        totals.map((t, i) => (
          <div key={t.currency} className={i === 0 ? "mt-1" : "mt-3 border-t border-border pt-3"}>
            <p className="tnum font-display text-4xl font-semibold tracking-tight">
              {formatMoney(t.monthly, t.currency)}
            </p>
            <p className="tnum mt-1 text-sm text-muted-foreground">
              {formatMoney(t.yearly, t.currency)} al año
            </p>
          </div>
        ))
      )}

      {main && cats.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium">Por categoría</p>
          <div
            className="flex h-2.5 gap-0.5 overflow-hidden rounded-full"
            role="img"
            aria-label={cats.map((c) => `${c.category} ${Math.round(c.share * 100)}%`).join(", ")}
          >
            {cats.map((c) => (
              <span
                key={c.category}
                style={{ width: `${c.share * 100}%`, backgroundColor: catColor(c.category) }}
              />
            ))}
          </div>
          <ul className="mt-3 grid gap-1.5 text-sm">
            {cats.slice(0, 5).map((c) => (
              <li key={c.category} className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    aria-hidden
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: catColor(c.category) }}
                  />
                  <span className="truncate">{c.category}</span>
                </span>
                <span className="tnum text-muted-foreground">
                  {formatMoney(c.monthly, main.currency)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
