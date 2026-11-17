"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/lib/types";

interface CartState {
  items: CartItem[];
  cep: string;
  add: (item: Omit<CartItem, "key" | "qty">, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  setCep: (cep: string) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      cep: "",
      add: (item, qty = 1) =>
        set((s) => {
          const key = `${item.artworkId}:${item.sizeId}:${item.frame}`;
          const found = s.items.find((i) => i.key === key);
          return {
            items: found
              ? s.items.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i))
              : [...s.items, { ...item, key, qty }],
          };
        }),
      setQty: (key, qty) =>
        set((s) => ({ items: qty <= 0 ? s.items.filter((i) => i.key !== key) : s.items.map((i) => (i.key === key ? { ...i, qty } : i)) })),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      setCep: (cep) => set({ cep }),
      clear: () => set({ items: [] }),
    }),
    { name: "wave-cart-v1", skipHydration: true },
  ),
);

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.qty, 0);
export const cartSubtotal = (items: CartItem[]) => items.reduce((n, i) => n + i.qty * i.unitPrice, 0);
