"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Order, OrderStatus } from "@/lib/types";
import { SEED_ORDERS } from "@/lib/data/orders";
import { supabase } from "@/lib/supabase";
import { useUI } from "./ui";

interface OrdersState {
  orders: Order[];
  /** Lê os pedidos do Supabase (só funciona logado como admin). */
  load: () => Promise<void>;
  place: (o: Omit<Order, "id" | "createdAt" | "status">) => Promise<Order>;
  setStatus: (id: string, status: OrderStatus) => void;
}

export const useOrders = create<OrdersState>()(
  persist(
    (set, get) => ({
      // os pedidos de exemplo só existem no modo demonstração
      orders: supabase ? [] : SEED_ORDERS,
      load: async () => {
        if (!supabase) return;
        const { data, error } = await supabase.from("orders").select("*").order("createdAt", { ascending: false });
        if (error) return console.error("[supabase]", error.message);
        set({ orders: (data ?? []) as Order[] });
      },
      place: async (o) => {
        let id: string;
        if (supabase) {
          // a função place_order grava o pedido e dá baixa no estoque
          const { data, error } = await supabase.rpc("place_order", { p: o });
          if (error) throw new Error(error.message);
          id = data as string;
        } else {
          id = `WV-${Math.max(1040, ...get().orders.map((x) => Number(x.id.replace(/\D/g, "")) || 0)) + 1}`;
        }
        const order: Order = { ...o, id, createdAt: new Date().toISOString(), status: "pago" };
        set((s) => ({ orders: [order, ...s.orders] }));
        return order;
      },
      setStatus: (id, status) => {
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)) }));
        supabase?.from("orders").update({ status }).eq("id", id).then(({ error }) => {
          if (error) { useUI.getState().notify("Não foi possível salvar no banco"); get().load(); }
        });
      },
    }),
    // no modo Supabase nada de pedidos fica guardado no navegador
    { name: "wave-orders-v1", skipHydration: true, partialize: (s) => (supabase ? { orders: [] } : { orders: s.orders }) },
  ),
);
