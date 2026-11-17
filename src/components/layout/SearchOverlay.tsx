"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCatalog } from "@/store/catalog";
import { useUI } from "@/store/ui";
import { brl } from "@/lib/format";
import { priceFrom } from "@/lib/pricing";
import ArtImage from "../art/ArtImage";

export default function SearchOverlay() {
  const { searchOpen, set } = useUI();
  const artworks = useCatalog((s) => s.artworks);
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const close = () => { set({ searchOpen: false }); setQ(""); };

  useEffect(() => {
    if (!searchOpen) return;
    input.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchOpen]);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return artworks.filter((a) => a.featured).slice(0, 5);
    return artworks.filter((a) => `${a.title} ${a.artist} ${a.style} ${a.technique}`.toLowerCase().includes(t)).slice(0, 8);
  }, [q, artworks]);

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div className="fixed inset-0 z-50 bg-navy-deep/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
          <motion.div role="dialog" aria-modal="true" aria-label="Buscar obras"
            initial={{ y: -40 }} animate={{ y: 0 }} exit={{ y: -40 }} transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.35 }}
            className="max-h-[92vh] overflow-y-auto bg-paper shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="container-site py-6 sm:py-10">
              <div className="flex items-center gap-4 border-b-2 border-navy pb-3">
                <Search size={22} className="shrink-0 text-navy" />
                <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por obra, artista ou estilo"
                  className="display min-w-0 flex-1 bg-transparent text-2xl text-navy placeholder:text-ink-mute/50 focus:outline-none sm:text-4xl" />
                <button type="button" onClick={close} aria-label="Fechar busca" className="grid h-11 w-11 place-items-center hover:text-wave"><X size={24} /></button>
              </div>
              <p className="eyebrow mt-6 text-ink-mute">{q.trim() ? `${results.length} resultado${results.length === 1 ? "" : "s"}` : "Em destaque"}</p>
              <ul className="mt-3 divide-y divide-ink/10">
                {results.map((a) => (
                  <li key={a.id}>
                    <Link href={`/obra/${a.slug}`} onClick={close} className="flex items-center gap-4 py-3 transition-colors hover:bg-paper-light">
                      <ArtImage src={a.image} alt={a.title} className="h-14 w-14 shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-display text-lg font-medium uppercase text-navy">{a.title}</span>
                        <span className="text-xs text-ink-mute">{a.artist} · {a.style}</span>
                      </span>
                      <span className="text-sm font-semibold">{brl(priceFrom(a))}</span>
                    </Link>
                  </li>
                ))}
                {results.length === 0 && <li className="py-8 text-sm text-ink-mute">Nada encontrado para “{q}”. Tente outro termo ou veja a loja completa.</li>}
              </ul>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
