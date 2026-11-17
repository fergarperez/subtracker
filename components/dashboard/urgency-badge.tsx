import { cn } from "cn";
import { formatCountdown, getUrgency, type Subscription } from "@/lib/dashboard";

const styles = {
  urgent: "bg-urgent/15 text-urgent",
  warning: "bg-warn/15 text-warn",
  safe: "bg-safe/15 text-safe",
  inactive: "bg-muted-foreground/15 text-muted-foreground",
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
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        styles[urgency],
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
