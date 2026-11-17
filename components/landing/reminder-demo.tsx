"use client";

import { useState } from "react";
import { BellRing, Mail, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildDemoReminders, buildReminderEmail } from "@/lib/reminders";

/** Demo local: muestra el aviso real con datos de ejemplo. No envía nada ni pide datos. */
export function ReminderDemo() {
  const [email, setEmail] = useState<{ subject: string; text: string } | null>(null);
  const [run, setRun] = useState(0);

  const play = () => {
    // Se calcula al pulsar (solo cliente) para que "mañana" sea siempre correcto.
    setEmail(buildReminderEmail(buildDemoReminders(new Date())));
    setRun((n) => n + 1);
  };

  return (
    <section
      id="aviso-ejemplo"
      className="grid scroll-mt-20 items-center gap-8 border-t border-border py-14 md:grid-cols-[1fr_1.1fr]"
    >
      <div className="flex flex-col items-start gap-4">
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Así te avisamos
        </h2>
        <p className="max-w-md text-muted-foreground">
          Unos días antes de cada cobro te llega un email como este. Es solo un ejemplo: no
          enviamos nada ni te pedimos datos.
        </p>
        {!email ? (
          <Button size="lg" onClick={play}>
            <BellRing aria-hidden /> Ver un aviso de ejemplo
          </Button>
        ) : (
          <Button size="lg" variant="secondary" onClick={play}>
            <RotateCcw aria-hidden /> Repetir
          </Button>
        )}
      </div>

      <div
        className="min-h-56 rounded-2xl border border-border bg-card p-4 shadow-2xl shadow-black/40 sm:p-5"
        aria-live="polite"
      >
        <div className="flex items-center gap-2 border-b border-border pb-3 text-sm text-muted-foreground">
          <Mail className="size-4" aria-hidden /> Bandeja de entrada
        </div>
        {email ? (
          <article key={run} className="mail-in mt-4 rounded-xl bg-muted/60 p-4">
            <p className="text-xs text-muted-foreground">De: SubTracker · ahora</p>
            <h3 className="mt-1 font-display text-base font-semibold">{email.subject}</h3>
            <p className="mt-3 text-sm whitespace-pre-line text-foreground/90">{email.text}</p>
          </article>
        ) : (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            Aquí aparecerá el aviso.
          </p>
        )}
      </div>
    </section>
  );
}
