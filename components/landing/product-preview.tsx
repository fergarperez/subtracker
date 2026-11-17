// Maqueta estática del dashboard con datos de ejemplo (sin llamadas a la API).
const kpis = [
  { label: "Gasto mensual", value: "86,47 €" },
  { label: "Gasto anual proyectado", value: "1.037,64 €" },
  { label: "Próximo cobro", value: "12,99 €", hint: "Netflix · Mañana" },
];

const upcoming = [
  { name: "Netflix", price: "12,99 €", when: "Mañana", style: "bg-red-500/15 text-red-400" },
  { name: "Spotify", price: "10,99 €", when: "En 4 días", style: "bg-amber-500/15 text-amber-400" },
  { name: "iCloud+", price: "2,99 €", when: "En 12 días", style: "bg-emerald-500/15 text-emerald-400" },
  { name: "Adobe CC", price: "60,49 €", when: "En 21 días", style: "bg-emerald-500/15 text-emerald-400" },
];

export function ProductPreview() {
  return (
    <div
      id="vista-previa"
      aria-label="Vista previa del dashboard con datos de ejemplo"
      className="scroll-mt-20 rounded-2xl border border-border bg-card p-4 sm:p-6"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-background p-4 text-left">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className="mt-1 font-mono text-xl font-semibold tabular-nums">{k.value}</p>
            {k.hint && <p className="text-xs text-muted-foreground">{k.hint}</p>}
          </div>
        ))}
      </div>
      <p className="mt-5 mb-2 text-left text-sm font-medium">Próximos vencimientos</p>
      <ul className="grid gap-2">
        {upcoming.map((u) => (
          <li
            key={u.name}
            className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
          >
            <span className="text-sm font-medium">{u.name}</span>
            <span className="flex items-center gap-3">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.style}`}>{u.when}</span>
              <span className="font-mono text-sm tabular-nums">{u.price}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
