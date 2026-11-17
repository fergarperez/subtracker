// Maqueta estática del dashboard con datos de ejemplo (sin llamadas a la API).
const marker = {
  urgent: "bg-urgent text-background",
  warning: "bg-warn text-background",
  safe: "bg-safe text-background",
} as const;

const charges = [
  { name: "Netflix", price: "12,99 €", when: "Mañana", tone: "urgent", pos: 6, row: 0 },
  { name: "Spotify", price: "10,99 €", when: "En 4 días", tone: "warning", pos: 15, row: 1 },
  { name: "iCloud+", price: "2,99 €", when: "En 12 días", tone: "safe", pos: 41, row: 0 },
  { name: "Adobe CC", price: "60,49 €", when: "En 21 días", tone: "safe", pos: 72, row: 0 },
] as const;

export function ProductPreview() {
  return (
    <div
      id="vista-previa"
      role="img"
      aria-label="Vista previa del dashboard con datos de ejemplo: Netflix te cobra mañana"
      className="scroll-mt-20 rounded-2xl border border-border bg-card p-5 text-left shadow-2xl shadow-black/40 sm:p-6"
    >
      <p className="text-sm text-muted-foreground">Próximo cobro</p>
      <div className="mt-1 flex items-start justify-between gap-4">
        <p className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Netflix te cobra mañana
        </p>
        <p className="tnum font-display text-2xl font-semibold sm:text-3xl">12,99 €</p>
      </div>

      <div className="relative mt-5 h-24">
        <div className="absolute top-12 right-0 left-0 h-px bg-border" />
        <span className="absolute top-14 left-0 text-xs text-muted-foreground">Hoy</span>
        <span className="absolute top-14 right-0 text-xs text-muted-foreground">30 días</span>
        {charges.map((c, i) => (
          <span
            key={c.name}
            className={`marker-in absolute flex size-8 items-center justify-center rounded-full font-display text-sm font-semibold ring-4 ring-card ${marker[c.tone]}`}
            style={{
              left: `clamp(16px, ${c.pos}%, calc(100% - 16px))`,
              top: c.row === 0 ? 32 : 0,
              animationDelay: `${300 + i * 120}ms`,
            }}
          >
            {c.name.charAt(0)}
          </span>
        ))}
      </div>

      <ul className="mt-2 grid gap-2">
        {charges.slice(0, 3).map((c) => (
          <li key={c.name} className="flex items-center justify-between rounded-xl bg-muted/60 px-4 py-3">
            <span className="text-sm font-medium">{c.name}</span>
            <span className="flex items-center gap-3">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  c.tone === "urgent"
                    ? "bg-urgent/15 text-urgent"
                    : c.tone === "warning"
                      ? "bg-warn/15 text-warn"
                      : "bg-safe/15 text-safe"
                }`}
              >
                {c.when}
              </span>
              <span className="tnum w-16 text-right text-sm">{c.price}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
