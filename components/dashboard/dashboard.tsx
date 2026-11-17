"use client";

import { useState } from "react";
import useSWR from "swr";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SUBSCRIPTIONS_KEY,
  createSubscription,
  deleteSubscription,
  fetchSubscriptions,
  updateSubscription,
  type SubscriptionPayload,
} from "@/lib/api-client";
import type { Subscription } from "@/lib/dashboard";
import { KpiCards } from "./kpi-cards";
import { SubscriptionFormDialog } from "./subscription-form";
import { SubscriptionList } from "./subscription-list";
import { Upcoming } from "./upcoming";

export function Dashboard() {
  const { data, error, isLoading, mutate } = useSWR(SUBSCRIPTIONS_KEY, fetchSubscriptions);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  function openForm(sub: Subscription | null) {
    setEditing(sub);
    setFormOpen(true);
  }

  async function handleSubmit(payload: SubscriptionPayload) {
    if (editing) await updateSubscription(editing.id, payload);
    else await createSubscription(payload);
    await mutate();
    setFormOpen(false);
  }

  async function run(action: () => Promise<unknown>) {
    setActionError(null);
    try {
      await action();
      await mutate();
    } catch {
      setActionError("No se pudo completar la acción. Inténtalo de nuevo.");
    }
  }

  const now = new Date();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <Button onClick={() => openForm(null)}>
          <Plus /> Nueva suscripción
        </Button>
      </div>

      {actionError && (
        <p role="alert" className="text-sm text-red-500">
          {actionError}
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando suscripciones…</p>
      ) : error || !data ? (
        <div className="rounded-xl border border-border bg-card p-5 text-sm">
          No se pudieron cargar tus suscripciones.{" "}
          <button type="button" className="text-primary underline" onClick={() => mutate()}>
            Reintentar
          </button>
        </div>
      ) : (
        <>
          <KpiCards subs={data} now={now} />
          <Upcoming subs={data} now={now} />
          <SubscriptionList
            subs={data}
            now={now}
            onEdit={openForm}
            onToggleStatus={(s) =>
              run(() => updateSubscription(s.id, { status: s.status === "active" ? "paused" : "active" }))
            }
            onDelete={(s) => {
              if (window.confirm(`¿Eliminar "${s.name}"? Esta acción no se puede deshacer.`)) {
                void run(() => deleteSubscription(s.id));
              }
            }}
          />
        </>
      )}

      <SubscriptionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        subscription={editing}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
