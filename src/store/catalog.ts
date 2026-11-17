"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Artwork } from "@/lib/types";
import { SEED_ARTWORKS } from "@/lib/data/artworks";
import { slugify } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { useUI } from "./ui";

interface CatalogState {
  artworks: Artwork[];
  load: () => Promise<void>;
  add: (a: Omit<Artwork, "id" | "slug" | "views" | "createdAt">) => void;
  update: (id: string, patch: Partial<Artwork>) => void;
  remove: (id: string) => void;
  addView: (id: string) => void;
  reset: () => void;
}

type Result = PromiseLike<{ error: { message: string } | null }>;

/**
 * Catálogo. Com Supabase configurado, lê e grava na tabela `artworks`;
 * sem ele, funciona só no navegador (modo demonstração).
 */
export const useCatalog = create<CatalogState>()(
  persist(
    (set, get) => {
      // grava no Supabase; se falhar, avisa e recarrega o estado real
      const sync = async (op: Result | undefined) => {
        if (!op) return;
        const { error } = await op;
        if (error) {
          useUI.getState().notify("Não foi possível salvar no banco");
          console.error("[supabase]", error.message);
          get().load();
        }
      };
      return {
        artworks: SEED_ARTWORKS,
        load: async () => {
          if (!supabase) return;
          const { data, error } = await supabase.from("artworks").select("*").order("createdAt", { ascending: false });
          if (error) return console.error("[supabase]", error.message);
          set({ artworks: (data ?? []) as Artwork[] });
        },
        add: (a) => {
          const id = `obra-${Date.now().toString(36)}`;
          let slug = slugify(a.title) || id;
          if (get().artworks.some((x) => x.slug === slug)) slug = `${slug}-${id.slice(-4)}`;
          const art: Artwork = { ...a, id, slug, views: 0, createdAt: new Date().toISOString() };
          set((s) => ({ artworks: [art, ...s.artworks] }));
          sync(supabase?.from("artworks").insert(art));
        },
        update: (id, patch) => {
          set((s) => ({ artworks: s.artworks.map((a) => (a.id === id ? { ...a, ...patch } : a)) }));
          sync(supabase?.from("artworks").update(patch).eq("id", id));
        },
        remove: (id) => {
          set((s) => ({ artworks: s.artworks.filter((a) => a.id !== id) }));
          sync(supabase?.from("artworks").delete().eq("id", id));
        },
        addView: (id) => {
          set((s) => ({ artworks: s.artworks.map((a) => (a.id === id ? { ...a, views: a.views + 1 } : a)) }));
          supabase?.rpc("increment_views", { p_id: id }).then(() => {});
        },
        reset: () => {
          set({ artworks: SEED_ARTWORKS });
          if (supabase) {
            const db = supabase;
            sync(db.from("artworks").delete().neq("id", "").then(() => db.from("artworks").insert(SEED_ARTWORKS)));
          }
        },
      };
    },
    { name: "wave-catalog-v1", skipHydration: true },
  ),
);
