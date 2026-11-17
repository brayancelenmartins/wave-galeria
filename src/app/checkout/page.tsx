"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, CreditCard, FileText, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import ArtImage from "@/components/art/ArtImage";
import { FRAMES, PAYMENTS, PIX_DISCOUNT } from "@/lib/constants";
import { brl, cn } from "@/lib/format";
import { fakeAddress, maskCep, quoteShipping } from "@/lib/shipping";
import type { Customer, Order, PaymentMethod } from "@/lib/types";
import { cartSubtotal, useCart } from "@/store/cart";
import { useCatalog } from "@/store/catalog";
import { useOrders } from "@/store/orders";
import { useUI } from "@/store/ui";
import { isRemote } from "@/lib/supabase";

const STEPS = ["Endereço", "Pagamento", "Confirmação"];
const EMPTY: Customer = { name: "", email: "", phone: "", cep: "", street: "", number: "", complement: "", city: "", state: "" };
const PAY_ICON = { pix: QrCode, cartao: CreditCard, boleto: FileText };

export default function CheckoutPage() {
  const { items, cep, setCep, clear } = useCart();
  const place = useOrders((s) => s.place);
  const catalog = useCatalog();
  const [step, setStep] = useState(0);
  const [c, setC] = useState<Customer>(EMPTY);
  const [payment, setPayment] = useState<PaymentMethod>("pix");
  const [card, setCard] = useState({ number: "", name: "", exp: "", cvv: "", parcels: "1" });
  const [done, setDone] = useState<Order | null>(null);
  const [sending, setSending] = useState(false);
  const notify = useUI((s) => s.notify);

  // CEP já informado no carrinho: aproveita e preenche cidade/UF
  useEffect(() => {
    const addr = fakeAddress(cep);
    if (addr) setC((p) => (p.cep || p.city ? p : { ...p, cep, ...addr }));
  }, [cep]);

  const cepValue = c.cep || cep;
  const subtotal = cartSubtotal(items);
  const quote = quoteShipping(cepValue, subtotal);
  const shipping = quote?.price ?? 0;
  const discount = payment === "pix" ? Math.round(subtotal * PIX_DISCOUNT) : 0;
  const total = subtotal + shipping - discount;

  const field = (k: keyof Customer) => ({ value: k === "cep" ? cepValue : c[k], onChange: (e: React.ChangeEvent<HTMLInputElement>) => setC({ ...c, [k]: e.target.value }) });

  const onCep = (v: string) => {
    const masked = maskCep(v);
    const addr = fakeAddress(masked);
    setCep(masked);
    setC((p) => ({ ...p, cep: masked, ...(addr && !p.city ? addr : {}) }));
  };

  const confirm = async () => {
    setSending(true);
    let order: Order;
    try {
      order = await place({
      customer: { ...c, cep: cepValue }, payment,
      items: items.map(({ artworkId, title, sizeLabel, frame, qty, unitPrice }) => ({ artworkId, title, sizeLabel, frame, qty, unitPrice })),
        subtotal, shipping, discount, total,
      });
    } catch {
      notify("Não foi possível registrar o pedido. Tente de novo.");
      setSending(false);
      return;
    }
    if (isRemote) catalog.load(); // o banco já deu baixa no estoque
    else items.forEach((i) => {
      const a = catalog.artworks.find((x) => x.id === i.artworkId);
      if (a && a.status === "disponivel") {
        const stock = Math.max(0, a.stock - i.qty);
        catalog.update(a.id, { stock, status: stock === 0 ? "vendido" : a.status });
      }
    });
    clear();
    setDone(order);
    window.scrollTo({ top: 0 });
  };

  if (done) {
    return (
      <div className="container-site max-w-2xl py-20 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 14 }}
          className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-navy text-paper-light"><Check size={38} /></motion.div>
        <p className="eyebrow mt-8 text-wave">Pedido {done.id}</p>
        <h1 className="display mt-3 text-5xl text-navy md:text-6xl">Pedido confirmado</h1>
        <p className="mx-auto mt-5 max-w-md text-ink-soft">
          Obrigado, {done.customer.name.split(" ")[0]}. Enviamos os detalhes para {done.customer.email}.
          {done.payment === "pix" && " O código Pix vale por 30 minutos."}
          {done.payment === "boleto" && " O boleto vence em 3 dias úteis."}
        </p>
        <p className="mt-6 text-2xl font-semibold">{brl(done.total)} <span className="text-sm font-normal text-ink-mute">via {PAYMENTS[done.payment]}</span></p>
        <div className="mt-10 flex justify-center">
          <Link href="/loja" className="btn-solid">Continuar comprando</Link>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="container-site py-28 text-center">
        <h1 className="display mb-4 text-5xl text-navy">Carrinho vazio</h1>
        <p className="mb-8 text-ink-soft">Adicione uma obra para finalizar a compra.</p>
        <Link href="/loja" className="btn-solid">Ir para a loja <ArrowRight size={16} className="arrow" /></Link>
      </div>
    );
  }

  return (
    <div className="container-site pb-24 pt-8 md:pt-14">
      <h1 className="display text-5xl text-navy md:text-6xl">Checkout</h1>

      <ol className="mt-8 flex max-w-xl items-center gap-2 sm:gap-3">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-2 last:flex-none sm:gap-3" aria-current={i === step ? "step" : undefined}>
            <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-xs font-bold", i < step ? "border-navy bg-navy text-paper-light" : i === step ? "border-navy text-navy" : "border-ink/25 text-ink-mute")}>
              {i < step ? <Check size={14} /> : i + 1}
            </span>
            <span className={cn("eyebrow !text-[10px] sm:!text-[11px]", i > step && "text-ink-mute")}>{s}</span>
            {i < STEPS.length - 1 && <span className={cn("h-px flex-1", i < step ? "bg-navy" : "bg-ink/20")} />}
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_400px] lg:gap-16">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
            {step === 0 && (
              <form onSubmit={(e) => { e.preventDefault(); setStep(1); }} className="grid gap-4 sm:grid-cols-6">
                <F label="Nome completo" className="sm:col-span-6"><input required autoComplete="name" className="field" {...field("name")} /></F>
                <F label="E-mail" className="sm:col-span-3"><input required type="email" autoComplete="email" className="field" {...field("email")} /></F>
                <F label="Telefone" className="sm:col-span-3"><input required type="tel" autoComplete="tel" placeholder="(00) 00000-0000" className="field" {...field("phone")} /></F>
                <F label="CEP" className="sm:col-span-2">
                  <input required inputMode="numeric" pattern="\d{5}-\d{3}" title="Digite o CEP com 8 números" autoComplete="postal-code" placeholder="00000-000" className="field" value={cepValue} onChange={(e) => onCep(e.target.value)} />
                </F>
                <F label="Rua" className="sm:col-span-4"><input required autoComplete="address-line1" className="field" {...field("street")} /></F>
                <F label="Número" className="sm:col-span-2"><input required className="field" {...field("number")} /></F>
                <F label="Complemento" className="sm:col-span-4"><input className="field" autoComplete="address-line2" {...field("complement")} /></F>
                <F label="Cidade" className="sm:col-span-4"><input required autoComplete="address-level2" className="field" {...field("city")} /></F>
                <F label="UF" className="sm:col-span-2"><input required maxLength={2} autoComplete="address-level1" className="field uppercase" {...field("state")} /></F>
                <p className="text-sm text-ink-soft sm:col-span-6" aria-live="polite">
                  {quote ? <>Entrega para {quote.region}: <strong>{quote.free ? "frete grátis" : brl(quote.price)}</strong>, {quote.days}.</> : "Informe o CEP para calcular o frete."}
                </p>
                <div className="sm:col-span-6"><button type="submit" className="btn-solid">Ir para pagamento <ArrowRight size={16} className="arrow" /></button></div>
              </form>
            )}

            {step === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Forma de pagamento">
                  {(Object.keys(PAYMENTS) as PaymentMethod[]).map((p) => {
                    const Icon = PAY_ICON[p];
                    return (
                      <button key={p} type="button" role="radio" aria-checked={payment === p} onClick={() => setPayment(p)}
                        className={cn("flex flex-col items-start gap-3 border-2 p-4 text-left transition-colors", payment === p ? "border-navy bg-paper-light" : "border-ink/20 hover:border-ink/50")}>
                        <Icon size={22} className="text-wave" />
                        <span className="font-semibold">{PAYMENTS[p]}</span>
                        <span className="text-xs text-ink-mute">{p === "pix" ? "5% de desconto, aprovação na hora" : p === "cartao" ? "Até 10× sem juros" : "Vence em 3 dias úteis"}</span>
                      </button>
                    );
                  })}
                </div>

                {payment === "cartao" && (
                  <div className="mt-6 grid gap-4 sm:grid-cols-6">
                    <F label="Número do cartão" className="sm:col-span-6">
                      <input required inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" className="field" value={card.number}
                        onChange={(e) => setCard({ ...card, number: e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ") })} minLength={19} />
                    </F>
                    <F label="Nome impresso" className="sm:col-span-6"><input required autoComplete="cc-name" className="field uppercase" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} /></F>
                    <F label="Validade" className="sm:col-span-2">
                      <input required placeholder="MM/AA" autoComplete="cc-exp" pattern="\d{2}/\d{2}" className="field" value={card.exp}
                        onChange={(e) => setCard({ ...card, exp: e.target.value.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2") })} />
                    </F>
                    <F label="CVV" className="sm:col-span-2"><input required inputMode="numeric" autoComplete="cc-csc" pattern="\d{3,4}" maxLength={4} className="field" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "") })} /></F>
                    <F label="Parcelas" className="sm:col-span-2">
                      <select className="field" value={card.parcels} onChange={(e) => setCard({ ...card, parcels: e.target.value })}>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}× de {brl(total / n)}</option>)}
                      </select>
                    </F>
                  </div>
                )}
                {payment === "pix" && <p className="mt-6 border border-ink/15 bg-paper-light p-4 text-sm text-ink-soft">O QR Code é gerado ao confirmar o pedido. Você economiza <strong className="text-ink">{brl(discount)}</strong> pagando com Pix.</p>}
                {payment === "boleto" && <p className="mt-6 border border-ink/15 bg-paper-light p-4 text-sm text-ink-soft">O boleto é enviado por e-mail ao confirmar. A produção começa após a compensação (até 2 dias úteis).</p>}

                <div className="mt-8 flex flex-wrap gap-3">
                  <button type="button" onClick={() => setStep(0)} className="btn-outline"><ArrowLeft size={16} /> Voltar</button>
                  <button type="submit" className="btn-solid">Revisar pedido <ArrowRight size={16} className="arrow" /></button>
                </div>
              </form>
            )}

            {step === 2 && (
              <div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Review title="Entrega" onEdit={() => setStep(0)}>
                    {c.name}<br />{c.street}, {c.number}{c.complement && `, ${c.complement}`}<br />{c.city} / {c.state.toUpperCase()} · {cepValue}<br />{c.email} · {c.phone}
                  </Review>
                  <Review title="Pagamento" onEdit={() => setStep(1)}>
                    {PAYMENTS[payment]}{payment === "cartao" && <><br />Final {card.number.slice(-4)} · {card.parcels}× de {brl(total / Number(card.parcels))}</>}
                    {payment === "pix" && <><br />Desconto de {brl(discount)} aplicado</>}
                    <br />{quote ? `Prazo: ${quote.days}` : ""}
                  </Review>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-outline"><ArrowLeft size={16} /> Voltar</button>
                  <button type="button" onClick={confirm} disabled={sending} className="btn-solid">{sending ? "Enviando…" : `Confirmar pedido · ${brl(total)}`}</button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* resumo */}
        <aside className="h-fit bg-paper-light p-6 lg:sticky lg:top-28" aria-label="Resumo do pedido">
          <h2 className="font-display text-2xl font-medium uppercase text-navy">Resumo</h2>
          <ul className="mt-4 divide-y divide-ink/10">
            {items.map((i) => (
              <li key={i.key} className="flex gap-3 py-3">
                <ArtImage src={i.image} alt={i.title} className="h-16 w-14 shrink-0" />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate font-semibold">{i.title}</p>
                  <p className="text-xs text-ink-mute">{i.sizeLabel}</p>
                  <p className="text-xs text-ink-mute">Moldura: {FRAMES[i.frame].label} · Qtd. {i.qty}</p>
                </div>
                <span className="text-sm font-semibold">{brl(i.unitPrice * i.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1.5 border-t border-ink/15 pt-4 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{brl(subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Frete</dt><dd>{quote ? (quote.free ? "Grátis" : brl(shipping)) : "a calcular"}</dd></div>
            {discount > 0 && <div className="flex justify-between text-emerald-800"><dt>Desconto Pix</dt><dd>− {brl(discount)}</dd></div>}
            <div className="flex justify-between border-t border-ink/15 pt-3 text-lg font-bold"><dt>Total</dt><dd>{brl(total)}</dd></div>
          </dl>
        </aside>
      </div>
    </div>
  );
}

function F({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return <label className={cn("block", className)}><span className="label">{label}</span>{children}</label>;
}
function Review({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="border border-ink/15 p-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="eyebrow text-ink-mute">{title}</h3>
        <button type="button" onClick={onEdit} className="text-xs font-semibold text-wave hover:underline">Editar</button>
      </div>
      <p className="text-sm leading-relaxed">{children}</p>
    </div>
  );
}
