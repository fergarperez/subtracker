"use client";

import { useState } from "react";
import { Pause, Pencil, Play, Trash2 } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import {
  CYCLE_LABELS,
  filterByStatus,
  formatMoney,
  sortSubscriptions,
  type SortKey,
  type StatusFilter,
  type Subscription,
} from "@/lib/dashboard";
import { UrgencyBadge } from "./urgency-badge";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "active", label: "Activas" },
  { value: "paused", label: "Pausadas" },
  { value: "all", label: "Todas" },
];

type Props = {
  subs: Subscription[];
  now: Date;
  onEdit: (s: Subscription) => void;
  onToggleStatus: (s: Subscription) => void;
  onDelete: (s: Subscription) => void;
};

export function SubscriptionList({ subs, now, onEdit, onToggleStatus, onDelete }: Props) {
  const [filter, setFilter] = useState<StatusFilter>("active");
  const [sort, setSort] = useState<SortKey>("date");
  const items = sortSubscriptions(filterByStatus(subs, filter), sort);

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Suscripciones</h2>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                aria-pressed={filter === f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs",
                  filter === f.value
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <select
            aria-label="Ordenar por"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-7 rounded-md border border-input bg-background px-2 text-xs"
          >
            <option value="date">Fecha de cobro</option>
            <option value="amount">Importe</option>
          </select>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
          No hay suscripciones en esta vista.
        </p>
      ) : (
        <ul className="grid gap-2">
          {items.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{s.name}</p>
                <p className="text-xs text-muted-foreground">
                  {s.category} · {CYCLE_LABELS[s.billingCycle]} ·{" "}
                  <span className="font-mono tabular-nums">
                    {new Date(s.nextBillingDate).toLocaleDateString("es-ES", { timeZone: "UTC" })}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <UrgencyBadge sub={s} now={now} />
                <span className="font-mono tabular-nums">{formatMoney(s.price, s.currency)}</span>
                <div className="flex">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={s.status === "active" ? `Pausar ${s.name}` : `Reactivar ${s.name}`}
                    onClick={() => onToggleStatus(s)}
                  >
                    {s.status === "active" ? <Pause /> : <Play />}
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label={`Editar ${s.name}`} onClick={() => onEdit(s)}>
                    <Pencil />
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label={`Eliminar ${s.name}`} onClick={() => onDelete(s)}>
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
