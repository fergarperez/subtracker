"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { BellRing, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  SUBSCRIPTIONS_KEY,
  createSubscription,
  deleteSubscription,
  fetchSubscriptions,
  updateSubscription,
  type SubscriptionPayload,
} from "@/lib/api-client";
import type { Subscription } from "@/lib/dashboard";
import { SubscriptionFormDialog } from "./subscription-form";
import { SubscriptionList } from "./subscription-list";
import { Summary } from "./summary";
import { Upcoming } from "./upcoming";

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-card ${className}`} />;
}

export function Dashboard() {
  const { data, error, isLoading, mutate } = useSWR(SUBSCRIPTIONS_KEY, fetchSubscriptions);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [toDelete, setToDelete] = useState<Subscription | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  function openForm(sub: Subscription | null) {
    setEditing(sub);
    setFormOpen(true);
  }

  async function handleSubmit(payload: SubscriptionPayload) {
    const wasEditing = Boolean(editing);
    if (editing) await updateSubscription(editing.id, payload);
    else await createSubscription(payload);
    await mutate();
    setFormOpen(false);
    setNotice(wasEditing ? "Cambios guardados" : "Suscripción añadida");
  }

  async function run(action: () => Promise<unknown>, done: string) {
    setActionError(null);
    try {
      await action();
      await mutate();
      setNotice(done);
    } catch {
      setActionError("No se pudo completar la acción. Inténtalo de nuevo.");
    }
  }

  const now = new Date();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Tus suscripciones
        </h1>
        <Button size="lg" onClick={() => openForm(null)}>
          <Plus /> Nueva suscripción
        </Button>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {notice}
      </p>
      {notice && (
        <p
          className="rounded-lg bg-safe/10 px-3 py-2 text-sm text-safe"
        >
          {notice}
        </p>
      )}
      {actionError && (
        <p role="alert" className="rounded-lg bg-urgent/10 px-3 py-2 text-sm text-urgent">
          {actionError}
        </p>
      )}

      {isLoading ? (
        <div className="space-y-4" aria-busy>
          <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
          </div>
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : error || !data ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-sm">
          No pudimos cargar tus suscripciones.{" "}
          <button type="button" className="text-primary underline" onClick={() => mutate()}>
            Reintentar
          </button>
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-6 py-14 text-center">
          <BellRing className="mx-auto size-8 text-primary" aria-hidden />
          <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight">
            Empieza con tu primera suscripción
          </h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            Añade Netflix, Spotify o cualquier pago recurrente. Te mostraremos cuánto gastas y te
            avisaremos por email antes de cada cobro.
          </p>
          <Button size="lg" className="mt-6" onClick={() => openForm(null)}>
            <Plus /> Añadir suscripción
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <Upcoming subs={data} now={now} />
            <Summary subs={data} />
          </div>
          <SubscriptionList
            subs={data}
            now={now}
            onAdd={() => openForm(null)}
            onEdit={openForm}
            onToggleStatus={(s) => {
              const pausing = s.status === "active";
              void run(
                () => updateSubscription(s.id, { status: pausing ? "paused" : "active" }),
                pausing ? "Suscripción pausada" : "Suscripción reactivada",
              );
            }}
            onDelete={setToDelete}
          />
        </>
      )}

      <SubscriptionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        subscription={editing}
        onSubmit={handleSubmit}
      />

      <Dialog open={toDelete !== null} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent title="Eliminar suscripción">
          <p className="text-sm text-muted-foreground">
            Vas a eliminar «{toDelete?.name}». Esta acción no se puede deshacer. Si solo quieres
            dejar de ver sus cobros, pausa la suscripción.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setToDelete(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                const s = toDelete;
                setToDelete(null);
                if (s) void run(() => deleteSubscription(s.id), "Suscripción eliminada");
              }}
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
