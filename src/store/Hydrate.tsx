"use client";
import { useEffect } from "react";
import { useCatalog } from "./catalog";
import { useCart } from "./cart";
import { useFavorites } from "./favorites";
import { useOrders } from "./orders";

/** Carrega do localStorage depois da montagem, evitando divergência com o HTML do servidor. */
export default function Hydrate() {
  useEffect(() => {
    Promise.resolve(useCatalog.persist.rehydrate()).then(() => useCatalog.getState().load());
    useCart.persist.rehydrate();
    useFavorites.persist.rehydrate();
    useOrders.persist.rehydrate();
  }, []);
  return null;
}
