const ITEMS = ["100% Brasil", "Peças em edição limitada", "Arte original emoldurada", "Pix · Cartão · Boleto", "Envio para todo o Brasil"];

/** Faixa azul-marinho da referência; vira letreiro rolante em telas pequenas. */
export default function TrustStrip() {
  return (
    <div className="seigaiha overflow-hidden text-paper-light">
      <ul className="container-site hidden h-14 items-center justify-between gap-4 lg:flex">
        {ITEMS.map((t, i) => (
          <li key={t} className="eyebrow flex flex-1 items-center gap-4 whitespace-nowrap !text-[10.5px] last:flex-none">
            {t}{i < ITEMS.length - 1 && <span className="h-px min-w-6 flex-1 bg-paper-light/50" />}
          </li>
        ))}
      </ul>
      <div className="flex h-12 items-center lg:hidden" aria-hidden>
        <div className="flex animate-[marquee_26s_linear_infinite] whitespace-nowrap">
          {[...ITEMS, ...ITEMS].map((t, i) => (
            <span key={i} className="eyebrow flex items-center gap-5 pr-5 !text-[10.5px]">{t}<span className="h-px w-8 bg-paper-light/50" /></span>
          ))}
        </div>
      </div>
      <style>{`@keyframes marquee{to{transform:translateX(-50%)}}`}</style>
    </div>
  );
}
