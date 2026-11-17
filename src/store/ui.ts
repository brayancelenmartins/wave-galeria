"use client";
import { create } from "zustand";
import type { World } from "@/lib/types";

interface UIState {
  cartOpen: boolean;
  searchOpen: boolean;
  menuOpen: boolean;
  toast: string | null;
  /** mundo em transição (Choose your world) e o ponto do clique */
  world: { id: World; x: number; y: number } | null;
  set: (p: Partial<Omit<UIState, "set" | "notify" | "enterWorld">>) => void;
  enterWorld: (id: World, x: number, y: number) => void;
  notify: (msg: string) => void;
}

let timer: ReturnType<typeof setTimeout> | undefined;

export const useUI = create<UIState>((set) => ({
  cartOpen: false,
  searchOpen: false,
  menuOpen: false,
  toast: null,
  world: null,
  enterWorld: (id, x, y) => set({ world: { id, x, y } }),
  set: (p) => set(p),
  notify: (msg) => {
    clearTimeout(timer);
    set({ toast: msg });
    timer = setTimeout(() => set({ toast: null }), 2600);
  },
}));
