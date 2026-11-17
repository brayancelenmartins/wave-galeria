"use client";
import { Truck } from "lucide-react";
import { useCart } from "@/store/cart";
import { brl } from "@/lib/format";
import { maskCep, quoteShipping } from "@/lib/shipping";
import { FREE_SHIPPING_FROM } from "@/lib/constants";

export default function ShippingCalc({ subtotal }: { subtotal: number }) {
  const cep = useCart((s) => s.cep);
  const setCep = useCart((s) => s.setCep);
  const quote = quoteShipping(cep, subtotal);
  return (
    <div>
      <label htmlFor="cep-calc" className="label flex items-center gap-2"><Truck size={14} /> Calcular frete</label>
      <input id="cep-calc" inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" value={cep}
        onChange={(e) => setCep(maskCep(e.target.value))} className="field" />
      <p className="mt-2 min-h-5 text-xs text-ink-soft" aria-live="polite">
        {quote
          ? <>{quote.region}: <strong>{quote.free ? "Frete grátis" : brl(quote.price)}</strong> · {quote.days}</>
          : `Digite o CEP. Frete grátis acima de ${brl(FREE_SHIPPING_FROM)}.`}
      </p>
    </div>
  );
}
