import { cn } from "cn";

/** Marca: un anillo de ciclo con un punto de cobro. */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-display text-lg font-semibold tracking-tight",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden fill="none">
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
        <path
          d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5"
          stroke="var(--primary)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="20.5" cy="12" r="2" fill="var(--primary)" />
      </svg>
      SubTracker
    </span>
  );
}
