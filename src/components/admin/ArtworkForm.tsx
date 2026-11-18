"use client";
import { X } from "lucide-react";
import { useState } from "react";
import ImageDrop from "./ImageDrop";
import { orientationOf } from "@/lib/upload";
import { FRAME_IDS, FRAMES, SIZE_IDS, SIZES, STATUS, STATUS_IDS, STYLES, WORLD_IDS, WORLDS } from "@/lib/constants";
import { DEFAULT_DIMS } from "@/lib/data/artworks";
import { cn } from "@/lib/format";
import type { Artwork, FrameId, Orientation, SizeId } from "@/lib/types";

export type ArtworkDraft = Omit<Artwork, "id" | "slug" | "views" | "createdAt">;

export const emptyDraft = (): ArtworkDraft => ({
  title: "", artist: "", year: new Date().getFullYear(), style: "Abstrato", world: "brasil", technique: "", description: "", image: "",
  orientation: "retrato", basePrice: 2000, sizes: DEFAULT_DIMS.retrato, frames: [...FRAME_IDS], status: "disponivel", stock: 1, edition: "Edição de 20", featured: false,
});

export default function ArtworkForm({ initial, title, onSave, onClose }: { initial: ArtworkDraft; title: string; onSave: (d: ArtworkDraft) => void; onClose: () => void }) {
  const [d, setD] = useState<ArtworkDraft>(initial);
  const set = <K extends keyof ArtworkDraft>(k: K, v: ArtworkDraft[K]) => setD((p) => ({ ...p, [k]: v }));

  const setOrientation = (o: Orientation) => {
    const ids = d.sizes.map((s) => s.id);
    setD((p) => ({ ...p, orientation: o, sizes: DEFAULT_DIMS[o].filter((s) => ids.includes(s.id)) }));
  };
  const toggleSize = (id: SizeId) => {
    const has = d.sizes.some((s) => s.id === id);
    const next = has ? d.sizes.filter((s) => s.id !== id) : [...d.sizes, DEFAULT_DIMS[d.orientation].find((s) => s.id === id)!];
    set("sizes", SIZE_IDS.flatMap((x) => next.filter((s) => s.id === x)));
  };
  const setDim = (id: SizeId, k: "w" | "h", v: number) => set("sizes", d.sizes.map((s) => (s.id === id ? { ...s, [k]: v } : s)));
  const toggleFrame = (f: FrameId) => set("frames", d.frames.includes(f) ? d.frames.filter((x) => x !== f) : FRAME_IDS.filter((x) => x === f || d.frames.includes(x)));

  const valid = d.title.trim() && d.artist.trim() && d.sizes.length > 0 && d.frames.length > 0 && d.basePrice > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy-deep/60 p-0 sm:p-6" onClick={onClose}>
      <form role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-3xl bg-paper p-6 shadow-2xl sm:p-8" onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => { e.preventDefault(); if (valid) onSave(d); }}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="display text-3xl text-navy">{title}</h2>
          <button type="button" aria-label="Fechar" onClick={onClose} className="grid h-11 w-11 place-items-center hover:text-wave"><X size={22} /></button>
        </div>

        <div className="grid gap-4 sm:grid-cols-6">
          <L label="Título" className="sm:col-span-4"><input required className="field" value={d.title} onChange={(e) => set("title", e.target.value)} /></L>
          <L label="Ano" className="sm:col-span-2"><input type="number" required className="field" value={d.year} onChange={(e) => set("year", Number(e.target.value))} /></L>
          <L label="Artista" className="sm:col-span-3"><input required className="field" value={d.artist} onChange={(e) => set("artist", e.target.value)} /></L>
          <L label="Técnica" className="sm:col-span-3"><input className="field" value={d.technique} onChange={(e) => set("technique", e.target.value)} /></L>
          <L label="Estilo" className="sm:col-span-2"><select className="field" value={d.style} onChange={(e) => set("style", e.target.value as Artwork["style"])}>{STYLES.map((s) => <option key={s}>{s}</option>)}</select></L>
          <L label="Coleção" className="sm:col-span-2"><select className="field" value={d.world} onChange={(e) => set("world", e.target.value as Artwork["world"])}>{WORLD_IDS.map((w) => <option key={w} value={w}>{WORLDS[w].label}</option>)}</select></L>
          <L label="Formato" className="sm:col-span-2"><select className="field" value={d.orientation} onChange={(e) => setOrientation(e.target.value as Orientation)}><option value="retrato">Retrato</option><option value="paisagem">Paisagem</option><option value="quadrado">Quadrado</option></select></L>

          <div className="sm:col-span-6">
            <span className="label">Imagem da obra</span>
            <ImageDrop value={d.image} onChange={(url, img) => {
              set("image", url);
              // ajusta o formato da moldura às proporções da foto enviada
              if (img) setOrientation(orientationOf(img.width, img.height));
            }} />
          </div>

          <L label="Preço base (R$, tamanho médio)" className="sm:col-span-2"><input type="number" min={0} step={10} required className="field" value={d.basePrice} onChange={(e) => set("basePrice", Number(e.target.value))} /></L>
          <L label="Estoque" className="sm:col-span-1"><input type="number" min={0} className="field" value={d.stock} onChange={(e) => set("stock", Number(e.target.value))} /></L>
          <L label="Disponibilidade" className="sm:col-span-3"><select className="field" value={d.status} onChange={(e) => set("status", e.target.value as Artwork["status"])}>{STATUS_IDS.map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}</select></L>
          <L label="Edição" className="sm:col-span-3"><input className="field" value={d.edition} onChange={(e) => set("edition", e.target.value)} /></L>
          <label className="flex items-center gap-3 self-end pb-3 text-sm sm:col-span-3"><input type="checkbox" className="h-4 w-4 accent-navy" checked={d.featured} onChange={(e) => set("featured", e.target.checked)} /> Destacar na página inicial</label>

          <fieldset className="sm:col-span-6">
            <legend className="label">Tamanhos e dimensões (cm)</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {SIZE_IDS.map((id) => {
                const s = d.sizes.find((x) => x.id === id);
                return (
                  <div key={id} className={cn("flex items-center gap-3 border p-2.5", s ? "border-navy bg-paper-light" : "border-ink/20")}>
                    <label className="flex flex-1 items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-navy" checked={!!s} onChange={() => toggleSize(id)} />{SIZES[id].label}</label>
                    {s && <>
                      <input aria-label={`Largura ${SIZES[id].label}`} type="number" min={10} className="field !w-16 !px-2 !py-1.5" value={s.w} onChange={(e) => setDim(id, "w", Number(e.target.value))} />
                      <span className="text-ink-mute">×</span>
                      <input aria-label={`Altura ${SIZES[id].label}`} type="number" min={10} className="field !w-16 !px-2 !py-1.5" value={s.h} onChange={(e) => setDim(id, "h", Number(e.target.value))} />
                    </>}
                  </div>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="sm:col-span-6">
            <legend className="label">Molduras disponíveis</legend>
            <div className="flex flex-wrap gap-2">
              {FRAME_IDS.map((f) => <button key={f} type="button" aria-pressed={d.frames.includes(f)} onClick={() => toggleFrame(f)} className={cn("chip", d.frames.includes(f) && "chip-on")}>{FRAMES[f].label}</button>)}
            </div>
          </fieldset>

          <L label="Descrição" className="sm:col-span-6"><textarea rows={3} className="field" value={d.description} onChange={(e) => set("description", e.target.value)} /></L>
        </div>

        <div className="mt-7 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-outline">Cancelar</button>
          <button type="submit" disabled={!valid} className="btn-solid">Salvar obra</button>
        </div>
      </form>
    </div>
  );
}

function L({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return <label className={cn("block", className)}><span className="label">{label}</span>{children}</label>;
}
