import { cn } from "cn";
import { formatCountdown, getUrgency, type Subscription } from "@/lib/dashboard";

const styles = {
  urgent: "bg-red-500/15 text-red-400",
  warning: "bg-amber-500/15 text-amber-400",
  safe: "bg-emerald-500/15 text-emerald-400",
  inactive: "bg-zinc-500/15 text-zinc-400",
} as const;

export function UrgencyBadge({ sub, now }: { sub: Subscription; now: Date }) {
  const urgency = getUrgency(sub, now);
  const label =
    urgency === "inactive"
      ? sub.status === "paused"
        ? "Pausada"
        : "Cancelada"
      : formatCountdown(sub.nextBillingDate, now);
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", styles[urgency])}>
      {label}
    </span>
  );
}
