import { hueFromText } from "@/lib/dashboard";
import { cn } from "cn";

/** Inicial con color estable por nombre: ayuda a reconocer cada suscripción de un vistazo. */
export function Avatar({ name, className }: { name: string; className?: string }) {
  const hue = hueFromText(name);
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-xl font-display text-base font-semibold",
        className,
      )}
      style={{
        backgroundColor: `oklch(0.32 0.08 ${hue})`,
        color: `oklch(0.88 0.1 ${hue})`,
      }}
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}
