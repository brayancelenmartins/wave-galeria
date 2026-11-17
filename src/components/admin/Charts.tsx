import { brl } from "@/lib/format";

/** Barras verticais simples, uma série, com valor escrito em cada barra. */
export function BarChart({ data, format = String, label }: { data: { label: string; value: number }[]; format?: (v: number) => string; label: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div role="img" aria-label={`${label}: ${data.map((d) => `${d.label} ${format(d.value)}`).join(", ")}`}>
      <div className="flex h-52 items-end gap-2 border-b border-ink/25 sm:gap-4">
        {data.map((d) => (
          <div key={d.label} className="group flex h-full flex-1 flex-col items-center justify-end">
            <span className="mb-1.5 text-[11px] font-semibold tabular-nums text-ink-soft">{format(d.value)}</span>
            <div className="w-full max-w-14 rounded-t-[3px] bg-navy transition-colors group-hover:bg-wave" style={{ height: `${Math.max(1.5, (d.value / max) * 78)}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2 sm:gap-4">
        {data.map((d) => <span key={d.label} className="flex-1 text-center text-[11px] uppercase tracking-wider text-ink-mute">{d.label}</span>)}
      </div>
    </div>
  );
}

/** Ranking em barras horizontais. */
export function RankBars({ data, unit }: { data: { label: string; value: number }[]; unit: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ol className="space-y-3.5">
      {data.map((d, i) => (
        <li key={d.label}>
          <div className="mb-1 flex justify-between gap-4 text-sm">
            <span className="truncate"><span className="mr-2 tabular-nums text-ink-mute">{i + 1}.</span>{d.label}</span>
            <span className="shrink-0 font-semibold tabular-nums">{d.value.toLocaleString("pt-BR")} <span className="font-normal text-ink-mute">{unit}</span></span>
          </div>
          <div className="h-2 bg-ink/10"><div className="h-full rounded-r-[3px] bg-wave" style={{ width: `${(d.value / max) * 100}%` }} /></div>
        </li>
      ))}
    </ol>
  );
}

export const compactBRL = (v: number) => (v >= 1000 ? `R$ ${(v / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil` : brl(v));
