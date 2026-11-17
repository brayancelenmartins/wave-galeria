"use client";
import Link from "next/link";
import { Pencil, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import ArtworkForm, { emptyDraft, type ArtworkDraft } from "@/components/admin/ArtworkForm";
import ArtImage from "@/components/art/ArtImage";
import { STATUS, WORLDS } from "@/lib/constants";
import { brl, cn } from "@/lib/format";
import type { Artwork } from "@/lib/types";
import { useCatalog } from "@/store/catalog";
import { useUI } from "@/store/ui";

export default function AdminArtworks() {
  const { artworks, add, update, remove, reset } = useCatalog();
  const notify = useUI((s) => s.notify);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Artwork | "new" | null>(null);
  const [confirm, setConfirm] = useState<{ kind: "remove"; art: Artwork } | { kind: "reset" } | null>(null);

  const list = artworks.filter((a) => `${a.title} ${a.artist}`.toLowerCase().includes(q.toLowerCase()));

  const save = (d: ArtworkDraft) => {
    if (editing === "new") { add(d); notify("Obra adicionada"); }
    else if (editing) { update(editing.id, d); notify("Obra atualizada"); }
    setEditing(null);
  };

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-5xl text-navy">Obras</h1>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setConfirm({ kind: "reset" })} className="btn-outline !px-4 !py-2.5"><RotateCcw size={15} /> Restaurar exemplo</button>
          <button type="button" onClick={() => setEditing("new")} className="btn-solid !px-4 !py-2.5"><Plus size={16} /> Nova obra</button>
        </div>
      </div>

      <label className="relative mt-6 block max-w-sm">
        <span className="sr-only">Buscar obra</span>
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por título ou artista" className="field !bg-white/60 pl-9" />
      </label>

      <div className="mt-5 overflow-x-auto border border-ink/15 bg-white/60">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="eyebrow border-b border-ink/15 text-ink-mute">
            <tr>{["Obra", "Coleção", "Preço base", "Estoque", "Status", "Views", ""].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {list.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <ArtImage src={a.image} alt="" className="h-12 w-12 shrink-0" />
                    <div className="min-w-0">
                      <Link href={`/obra/${a.slug}`} className="block truncate font-semibold hover:text-wave">{a.title}</Link>
                      <span className="text-xs text-ink-mute">{a.artist} · {a.style}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{WORLDS[a.world].label}</td>
                <td className="px-4 py-3 tabular-nums">{brl(a.basePrice)}</td>
                <td className="px-4 py-3 tabular-nums">{a.stock}</td>
                <td className="px-4 py-3"><span className={cn("px-2 py-1 text-[11px] font-semibold text-white", STATUS[a.status].tone)}>{STATUS[a.status].label}</span></td>
                <td className="px-4 py-3 tabular-nums text-ink-soft">{a.views.toLocaleString("pt-BR")}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button type="button" aria-label={`Editar ${a.title}`} onClick={() => setEditing(a)} className="grid h-9 w-9 place-items-center hover:bg-navy hover:text-white"><Pencil size={15} /></button>
                    <button type="button" aria-label={`Remover ${a.title}`} onClick={() => setConfirm({ kind: "remove", art: a })} className="grid h-9 w-9 place-items-center hover:bg-sun hover:text-white"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-ink-mute">Nenhuma obra encontrada.</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <ArtworkForm key={editing === "new" ? "new" : editing.id} title={editing === "new" ? "Nova obra" : "Editar obra"}
          initial={editing === "new" ? emptyDraft() : editing} onSave={save} onClose={() => setEditing(null)} />
      )}

      {confirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-navy-deep/60 p-5" onClick={() => setConfirm(null)}>
          <div role="alertdialog" aria-modal="true" aria-label="Confirmar" className="w-full max-w-sm bg-paper p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-2xl font-medium uppercase text-navy">{confirm.kind === "remove" ? "Remover obra?" : "Restaurar catálogo?"}</h2>
            <p className="mt-2 text-sm text-ink-soft">
              {confirm.kind === "remove" ? `“${confirm.art.title}” sairá da loja e da galeria.` : "As obras voltam ao catálogo de exemplo. Suas alterações serão perdidas."}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirm(null)} className="btn-outline !px-4 !py-2.5">Cancelar</button>
              <button type="button" className="btn-solid !border-sun !bg-sun !px-4 !py-2.5"
                onClick={() => { if (confirm.kind === "remove") { remove(confirm.art.id); notify("Obra removida"); } else { reset(); notify("Catálogo restaurado"); } setConfirm(null); }}>
                {confirm.kind === "remove" ? "Remover" : "Restaurar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
