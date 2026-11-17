"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "cn";
import { formatMoney, upcomingCharges, type Subscription } from "@/lib/dashboard";
import { UrgencyBadge } from "./urgency-badge";

const WINDOWS = [7, 15, 30] as const;

export function Upcoming({ subs, now }: { subs: Subscription[]; now: Date }) {
  const [days, setDays] = useState<(typeof WINDOWS)[number]>(30);
  const items = upcomingCharges(subs, now, days);

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Próximos vencimientos</h2>
        <div className="flex gap-1">
          {WINDOWS.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setDays(w)}
              aria-pressed={days === w}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs",
                days === w ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              {w} días
            </button>
          ))}
        </div>
      </div>
      {items.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
          No hay cobros en los próximos {days} días.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => (
            <li key={s.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">{s.name}</p>
                <UrgencyBadge sub={s} now={now} />
              </div>
              <p className="mt-2 font-mono text-lg tabular-nums">{formatMoney(s.price, s.currency)}</p>
              <p className="font-mono text-xs text-muted-foreground tabular-nums">
                {new Date(s.nextBillingDate).toLocaleDateString("es-ES", { timeZone: "UTC" })}
              </p>
              {s.cancelUrl && (
                <a
                  href={s.cancelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancelar suscripción <ExternalLink className="size-3" />
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
