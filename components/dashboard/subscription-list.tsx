"use client";

import { useState } from "react";
import { Pause, Pencil, Play, Plus, Trash2 } from "lucide-react";
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
import { Avatar } from "./avatar";
import { UrgencyBadge } from "./urgency-badge";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "active", label: "Activas" },
  { value: "paused", label: "Pausadas" },
  { value: "all", label: "Todas" },
];

type Props = {
  subs: Subscription[];
  now: Date;
  onAdd: () => void;
  onEdit: (s: Subscription) => void;
  onToggleStatus: (s: Subscription) => void;
  onDelete: (s: Subscription) => void;
};

export function SubscriptionList({ subs, now, onAdd, onEdit, onToggleStatus, onDelete }: Props) {
  const [filter, setFilter] = useState<StatusFilter>("active");
  const [sort, setSort] = useState<SortKey>("date");
  const items = sortSubscriptions(filterByStatus(subs, filter), sort);

  return (
    <section aria-label="Tus suscripciones">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold tracking-tight">Tus suscripciones</h2>
        <div className="flex items-center gap-2">
          <div role="group" aria-label="Filtrar por estado" className="flex rounded-lg bg-muted p-0.5">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                aria-pressed={filter === f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  filter === f.value
                    ? "bg-surface text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
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
            className="h-8 rounded-lg border border-input bg-background px-2 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <option value="date">Por fecha de cobro</option>
            <option value="amount">Por importe</option>
          </select>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="font-medium">
            {filter === "paused" ? "No tienes suscripciones pausadas" : "No hay suscripciones aquí"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {filter === "paused"
              ? "Cuando pauses una, la verás en esta vista."
              : "Añade la primera para empezar a controlar tus cobros."}
          </p>
          {filter !== "paused" && (
            <Button className="mt-4" onClick={onAdd}>
              <Plus /> Añadir suscripción
            </Button>
          )}
        </div>
      ) : (
        <ul className="grid gap-2">
          {items.map((s) => (
            <li
              key={s.id}
              className={cn(
                "group flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-border bg-card p-3 pr-4 transition-colors hover:border-input",
                s.status !== "active" && "opacity-70",
              )}
            >
              <Avatar name={s.name} />
              <div className="min-w-0 flex-1 basis-40">
                <p className="truncate font-medium">{s.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {s.category}, {CYCLE_LABELS[s.billingCycle].toLowerCase()}
                </p>
              </div>
              <UrgencyBadge sub={s} now={now} />
              <span className="tnum w-24 text-right font-display text-lg font-semibold">
                {formatMoney(s.price, s.currency)}
              </span>
              <div className="flex gap-0.5 sm:opacity-0 sm:transition-opacity sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={s.status === "active" ? `Pausar ${s.name}` : `Reactivar ${s.name}`}
                  title={s.status === "active" ? "Pausar" : "Reactivar"}
                  onClick={() => onToggleStatus(s)}
                >
                  {s.status === "active" ? <Pause /> : <Play />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Editar ${s.name}`}
                  title="Editar"
                  onClick={() => onEdit(s)}
                >
                  <Pencil />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Eliminar ${s.name}`}
                  title="Eliminar"
                  onClick={() => onDelete(s)}
                >
                  <Trash2 />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
