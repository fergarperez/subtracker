"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BILLING_CYCLES } from "@/lib/billing";
import { CYCLE_LABELS, STATUS_LABELS, type Subscription } from "@/lib/dashboard";
import { SUBSCRIPTION_STATUSES } from "@/lib/validations/subscription";
import type { SubscriptionPayload } from "@/lib/api-client";

const field =
  "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Suscripción a editar; `null` para crear. */
  subscription: Subscription | null;
  onSubmit: (data: SubscriptionPayload) => Promise<void>;
};

export function SubscriptionFormDialog({ open, onOpenChange, subscription, onSubmit }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={subscription ? "Editar suscripción" : "Nueva suscripción"}>
        {/* Se remonta al abrir/cambiar de suscripción para reiniciar el formulario. */}
        <SubscriptionForm
          key={subscription?.id ?? "new"}
          subscription={subscription}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function SubscriptionForm({
  subscription: s,
  onSubmit,
  onCancel,
}: {
  subscription: Subscription | null;
  onSubmit: Props["onSubmit"];
  onCancel: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const str = (k: string) => String(f.get(k) ?? "").trim();
    setPending(true);
    setError(null);
    try {
      await onSubmit({
        name: str("name"),
        price: Number(str("price").replace(",", ".")),
        currency: str("currency") || "EUR",
        billingCycle: str("billingCycle") as SubscriptionPayload["billingCycle"],
        nextBillingDate: `${str("nextBillingDate")}T00:00:00.000Z`,
        reminderDays: Number(str("reminderDays")),
        category: str("category") || "General",
        status: str("status") as SubscriptionPayload["status"],
        cancelUrl: str("cancelUrl") || null,
        notes: str("notes") || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ha ocurrido un error.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <Label text="Nombre">
        <input name="name" required maxLength={100} defaultValue={s?.name} className={field} />
      </Label>
      <div className="grid grid-cols-2 gap-4">
        <Label text="Precio">
          <input
            name="price"
            required
            inputMode="decimal"
            defaultValue={s?.price}
            className={`${field} tabular-nums`}
          />
        </Label>
        <Label text="Divisa">
          <input
            name="currency"
            required
            maxLength={3}
            defaultValue={s?.currency ?? "EUR"}
            className={`${field} uppercase`}
          />
        </Label>
        <Label text="Ciclo">
          <select name="billingCycle" defaultValue={s?.billingCycle ?? "monthly"} className={field}>
            {BILLING_CYCLES.map((c) => (
              <option key={c} value={c}>
                {CYCLE_LABELS[c]}
              </option>
            ))}
          </select>
        </Label>
        <Label text="Próximo cobro">
          <input
            name="nextBillingDate"
            type="date"
            required
            defaultValue={s?.nextBillingDate.slice(0, 10)}
            className={field}
          />
        </Label>
        <Label text="Días de aviso">
          <input
            name="reminderDays"
            type="number"
            min={0}
            max={90}
            required
            defaultValue={s?.reminderDays ?? 3}
            className={field}
          />
        </Label>
        <Label text="Estado">
          <select name="status" defaultValue={s?.status ?? "active"} className={field}>
            {SUBSCRIPTION_STATUSES.map((st) => (
              <option key={st} value={st}>
                {STATUS_LABELS[st]}
              </option>
            ))}
          </select>
        </Label>
      </div>
      <Label text="Categoría">
        <input name="category" maxLength={50} defaultValue={s?.category ?? "General"} className={field} />
      </Label>
      <Label text="URL de cancelación (opcional)">
        <input
          name="cancelUrl"
          type="url"
          maxLength={2048}
          placeholder="https://"
          defaultValue={s?.cancelUrl ?? ""}
          className={field}
        />
      </Label>
      <Label text="Notas (opcional)">
        <textarea
          name="notes"
          maxLength={1000}
          rows={3}
          defaultValue={s?.notes ?? ""}
          className={`${field} h-auto py-2`}
        />
      </Label>
      {error && (
        <p role="alert" className="text-sm text-urgent">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}

function Label({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium">{text}</span>
      {children}
    </label>
  );
}
