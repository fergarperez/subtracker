"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "cn";
import {
  formatCountdown,
  formatMoney,
  getUrgency,
  markerRows,
  nextCharge,
  timelinePosition,
  upcomingCharges,
  type Subscription,
} from "@/lib/dashboard";
import { Avatar } from "./avatar";
import { UrgencyBadge } from "./urgency-badge";

const WINDOWS = [7, 15, 30] as const;
const markerColor = {
  urgent: "bg-urgent text-background",
  warning: "bg-warn text-background",
  safe: "bg-safe text-background",
  inactive: "bg-muted-foreground text-background",
} as const;

function headline(next: Subscription, now: Date) {
  const when = formatCountdown(next.nextBillingDate, now);
  const text = when === "Mañana" ? "mañana" : when.replace(/^En /, "en ");
  return `${next.name} te cobra ${text}`;
}

/** Frase principal + línea de tiempo de los próximos cobros. */
export function Upcoming({ subs, now }: { subs: Subscription[]; now: Date }) {
  const [days, setDays] = useState<(typeof WINDOWS)[number]>(30);
  const next = nextCharge(subs, now);
  const items = upcomingCharges(subs, now, days);

  const positions = items.map((s) => timelinePosition(s.nextBillingDate, now, days));
  const rows = markerRows(positions);
  const markers = items.map((s, i) => ({ s, pos: positions[i], row: rows[i] }));

  return (
    <section aria-label="Próximos cobros" className="rounded-2xl border border-border bg-card p-6">
      {next ? (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Próximo cobro</p>
            <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {headline(next, now)}
            </h2>
          </div>
          <p className="tnum font-display text-3xl font-semibold sm:text-4xl">
            {formatMoney(next.price, next.currency)}
          </p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-muted-foreground">Próximo cobro</p>
          <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            Sin cobros a la vista
          </h2>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-sm font-medium">Próximos {days} días</p>
        <div role="group" aria-label="Ventana de tiempo" className="flex rounded-lg bg-muted p-0.5">
          {WINDOWS.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setDays(w)}
              aria-pressed={days === w}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                days === w
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {w} días
            </button>
          ))}
        </div>
      </div>

      {/* key=days reinicia la animación de entrada al cambiar de ventana */}
      <div key={days} aria-hidden className="relative mt-4 h-24 select-none">
        <div className="absolute top-12 right-0 left-0 h-px bg-border" />
        <span className="absolute top-14 left-0 text-xs text-muted-foreground">Hoy</span>
        <span className="absolute top-14 right-0 text-xs text-muted-foreground">{days} días</span>
        {markers.map(({ s, pos, row }, i) => (
          <span
            key={s.id}
            title={`${s.name}: ${formatMoney(s.price, s.currency)}`}
            className={cn(
              "marker-in absolute flex size-8 items-center justify-center rounded-full font-display text-sm font-semibold ring-4 ring-card",
              markerColor[getUrgency(s, now)],
            )}
            style={{
              left: `clamp(16px, ${pos * 100}%, calc(100% - 16px))`,
              top: row === 0 ? 32 : 0,
              animationDelay: `${i * 70}ms`,
            }}
          >
            {s.name.trim().charAt(0).toUpperCase()}
          </span>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          No tienes cobros en los próximos {days} días.
        </p>
      ) : (
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {items.map((s) => (
            <li key={s.id} className="flex items-center gap-3 rounded-xl bg-muted/60 p-3">
              <Avatar name={s.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{s.name}</p>
                <p className="tnum text-xs text-muted-foreground">
                  {new Date(s.nextBillingDate).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                    timeZone: "UTC",
                  })}
                  , {formatMoney(s.price, s.currency)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <UrgencyBadge sub={s} now={now} />
                {s.cancelUrl && (
                  <a
                    href={s.cancelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancelar <ExternalLink className="size-3" aria-hidden />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
