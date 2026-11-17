"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Minus, Plus, Trash2, X } from "lucide-react";
import { useEffect } from "react";
import { cartSubtotal, useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { FRAMES } from "@/lib/constants";
import { brl } from "@/lib/format";
import { quoteShipping } from "@/lib/shipping";
import ArtImage from "../art/ArtImage";
import ShippingCalc from "./ShippingCalc";

export default function CartDrawer() {
  const { cartOpen, set } = useUI();
  const { items, setQty, remove, cep } = useCart();
  const subtotal = cartSubtotal(items);
  const quote = quoteShipping(cep, subtotal);
  const close = () => set({ cartOpen: false });

  useEffect(() => {
    document.body.style.overflow = cartOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartOpen]);

  return (
    <AnimatePresence>
      {cartOpen && (
        <motion.div className="fixed inset-0 z-50 bg-navy-deep/55" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
          <motion.aside role="dialog" aria-modal="true" aria-label="Carrinho"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.4 }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-paper shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-ink/15 px-6 py-5">
              <h2 className="display text-3xl text-navy">Carrinho</h2>
              <button type="button" onClick={close} aria-label="Fechar carrinho" className="grid h-11 w-11 place-items-center hover:text-wave"><X size={22} /></button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
                <p className="text-ink-soft">Seu carrinho está vazio. As paredes também.</p>
                <Link href="/loja" onClick={close} className="btn-solid">Ver a loja <ArrowRight size={16} className="arrow" /></Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-ink/10 overflow-y-auto px-6">
                  {items.map((i) => (
                    <li key={i.key} className="flex gap-4 py-5">
                      <Link href={`/obra/${i.slug}`} onClick={close} className="shrink-0"><ArtImage src={i.image} alt={i.title} className="h-24 w-20" /></Link>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-lg font-medium uppercase text-navy">{i.title}</p>
                        <p className="text-xs text-ink-mute">{i.sizeLabel}</p>
                        <p className="text-xs text-ink-mute">Moldura: {FRAMES[i.frame].label}</p>
                        <div className="mt-2.5 flex items-center justify-between">
                          <div className="flex items-center border border-ink/25">
                            <button type="button" aria-label="Diminuir quantidade" onClick={() => setQty(i.key, i.qty - 1)} className="grid h-8 w-8 place-items-center hover:bg-paper-dark"><Minus size={13} /></button>
                            <span className="w-7 text-center text-sm font-semibold" aria-live="polite">{i.qty}</span>
                            <button type="button" aria-label="Aumentar quantidade" onClick={() => setQty(i.key, i.qty + 1)} className="grid h-8 w-8 place-items-center hover:bg-paper-dark"><Plus size={13} /></button>
                          </div>
                          <span className="text-sm font-semibold">{brl(i.unitPrice * i.qty)}</span>
                        </div>
                      </div>
                      <button type="button" aria-label={`Remover ${i.title}`} onClick={() => remove(i.key)} className="self-start p-1 text-ink-mute hover:text-sun"><Trash2 size={16} /></button>
                    </li>
                  ))}
                </ul>
                <div className="space-y-4 border-t border-ink/15 bg-paper-light px-6 py-5">
                  <ShippingCalc subtotal={subtotal} />
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex justify-between"><dt>Subtotal</dt><dd>{brl(subtotal)}</dd></div>
                    <div className="flex justify-between text-ink-soft"><dt>Frete</dt><dd>{quote ? (quote.free ? "Grátis" : brl(quote.price)) : "a calcular"}</dd></div>
                    <div className="flex justify-between border-t border-ink/15 pt-2 text-base font-bold"><dt>Total</dt><dd>{brl(subtotal + (quote?.price ?? 0))}</dd></div>
                  </dl>
                  <Link href="/checkout" onClick={close} className="btn-solid w-full">Finalizar compra <ArrowRight size={16} className="arrow" /></Link>
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
