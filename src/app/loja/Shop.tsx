"use client";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ArtCard from "@/components/art/ArtCard";
import PageHead from "@/components/ui/PageHead";
import { SIZE_IDS, SIZES, STATUS, STATUS_IDS, STYLES, WORLD_IDS, WORLDS } from "@/lib/constants";
import { brl, cn } from "@/lib/format";
import { priceFrom } from "@/lib/pricing";
import type { ArtworkStatus, SizeId, Style, World } from "@/lib/types";
import { useCatalog } from "@/store/catalog";

type Sort = "recentes" | "preco-asc" | "preco-desc" | "populares";
const SORTS: Record<Sort, string> = { recentes: "Mais recentes", "preco-asc": "Menor preço", "preco-desc": "Maior preço", populares: "Mais populares" };

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export default function Shop() {
  const artworks = useCatalog((s) => s.artworks);
  const params = useSearchParams();
  const router = useRouter();

  const ceiling = useMemo(() => Math.max(1000, ...artworks.map(priceFrom)), [artworks]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [sizes, setSizes] = useState<SizeId[]>([]);
  const [status, setStatus] = useState<ArtworkStatus[]>([]);
  const [world, setWorld] = useState<World | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [sort, setSort] = useState<Sort>("recentes");
  const [open, setOpen] = useState(false);

  // filtros vindos da URL (ex.: /loja?mundo=brasil, a partir de "Choose your world")
  useEffect(() => {
    const m = params.get("mundo");
    setWorld(m && (WORLD_IDS as string[]).includes(m) ? (m as World) : null);
    const e = params.get("estilo");
    if (e && (STYLES as string[]).includes(e)) setStyles([e as Style]);
  }, [params]);

  const list = useMemo(() => {
    const out = artworks.filter((a) =>
      (!styles.length || styles.includes(a.style)) &&
      (!sizes.length || a.sizes.some((s) => sizes.includes(s.id))) &&
      (!status.length || status.includes(a.status)) &&
      (!world || a.world === world) &&
      (maxPrice === null || priceFrom(a) <= maxPrice));
    const by: Record<Sort, (a: typeof out[number], b: typeof out[number]) => number> = {
      recentes: (a, b) => b.createdAt.localeCompare(a.createdAt),
      "preco-asc": (a, b) => priceFrom(a) - priceFrom(b),
      "preco-desc": (a, b) => priceFrom(b) - priceFrom(a),
      populares: (a, b) => b.views - a.views,
    };
    return out.sort(by[sort]);
  }, [artworks, styles, sizes, status, world, maxPrice, sort]);

  const active = styles.length + sizes.length + status.length + (world ? 1 : 0) + (maxPrice !== null ? 1 : 0);
  const clear = () => { setStyles([]); setSizes([]); setStatus([]); setMaxPrice(null); setWorld(null); router.replace("/loja", { scroll: false }); };

  const filters = (
    <div className="space-y-8">
      <Group title="Coleção">
        {WORLD_IDS.map((w) => <Chip key={w} on={world === w} onClick={() => setWorld(world === w ? null : w)}>{WORLDS[w].label}</Chip>)}
      </Group>
      <Group title="Estilo">
        {STYLES.map((s) => <Chip key={s} on={styles.includes(s)} onClick={() => setStyles(toggle(styles, s))}>{s}</Chip>)}
      </Group>
      <Group title="Tamanho">
        {SIZE_IDS.map((s) => <Chip key={s} on={sizes.includes(s)} onClick={() => setSizes(toggle(sizes, s))}>{SIZES[s].label}</Chip>)}
      </Group>
      <div>
        <label htmlFor="preco" className="label flex justify-between"><span>Preço máximo</span><span className="text-navy">{maxPrice === null ? "Qualquer" : `até ${brl(maxPrice)}`}</span></label>
        <input id="preco" type="range" min={1000} max={ceiling} step={100} value={maxPrice ?? ceiling}
          onChange={(e) => { const v = Number(e.target.value); setMaxPrice(v >= ceiling ? null : v); }} className="w-full accent-navy" />
        <div className="flex justify-between text-[11px] text-ink-mute"><span>{brl(1000)}</span><span>{brl(ceiling)}</span></div>
      </div>
      <Group title="Disponibilidade">
        {STATUS_IDS.map((s) => <Chip key={s} on={status.includes(s)} onClick={() => setStatus(toggle(status, s))}>{STATUS[s].label}</Chip>)}
      </Group>
      {active > 0 && <button type="button" onClick={clear} className="eyebrow flex items-center gap-2 text-sun hover:underline"><X size={14} /> Limpar filtros</button>}
    </div>
  );

  return (
    <>
    <PageHead title={world ? WORLDS[world].label : "Loja"} />
    <div className="container-site pb-24">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-y border-ink/15 py-4">
        <button type="button" onClick={() => setOpen(true)} className="chip flex items-center gap-2 lg:hidden">
          <SlidersHorizontal size={14} /> Filtros{active ? ` (${active})` : ""}
        </button>
        <p className="eyebrow text-ink-mute" aria-live="polite">{list.length} obra{list.length === 1 ? "" : "s"}</p>
        <label className="flex items-center gap-3 text-sm">
          <span className="eyebrow hidden text-ink-mute sm:inline">Ordenar</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field !w-auto !py-2 pr-8">
            {(Object.keys(SORTS) as Sort[]).map((s) => <option key={s} value={s}>{SORTS[s]}</option>)}
          </select>
        </label>
      </div>

      <div className="grid gap-12 lg:grid-cols-[250px_1fr]">
        <aside className="hidden lg:block" aria-label="Filtros"><div className="sticky top-28">{filters}</div></aside>

        <div>
          {list.length ? (
            <motion.div layout className="grid grid-cols-2 gap-x-5 gap-y-12 xl:grid-cols-3 xl:gap-x-9">
              <AnimatePresence mode="popLayout">
                {list.map((a) => (
                  <motion.div key={a.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.3 }}>
                    <ArtCard art={a} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="py-16 text-center">
              <p className="mb-5 text-ink-soft">Nenhuma obra combina com esses filtros.</p>
              <button type="button" onClick={clear} className="btn-outline">Limpar filtros</button>
            </div>
          )}
        </div>
      </div>

      {/* filtros em gaveta no celular */}
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 bg-navy-deep/55 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
            <motion.div role="dialog" aria-modal="true" aria-label="Filtros" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.4 }}
              className="absolute inset-x-0 bottom-0 max-h-[86vh] overflow-y-auto bg-paper p-6" onClick={(e) => e.stopPropagation()}>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="display text-3xl text-navy">Filtros</h2>
                <button type="button" aria-label="Fechar filtros" onClick={() => setOpen(false)} className="grid h-11 w-11 place-items-center"><X size={22} /></button>
              </div>
              {filters}
              <button type="button" onClick={() => setOpen(false)} className="btn-solid mt-8 w-full">Ver {list.length} obra{list.length === 1 ? "" : "s"}</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (<fieldset><legend className="label">{title}</legend><div className="flex flex-wrap gap-2">{children}</div></fieldset>);
}
function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" aria-pressed={on} onClick={onClick} className={cn("chip", on && "chip-on")}>{children}</button>;
}
