"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Award, ChevronRight, Heart, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import ArtCard from "@/components/art/ArtCard";
import ArtImage from "@/components/art/ArtImage";
import Frame, { RATIO } from "@/components/art/Frame";
import RoomMockup from "@/components/art/RoomMockup";
import ZoomImage from "@/components/art/ZoomImage";
import { FRAMES, SIZES, STATUS, WORLDS } from "@/lib/constants";
import { brl, cn } from "@/lib/format";
import { priceFor, sizeLabel } from "@/lib/pricing";
import type { FrameId, SizeId } from "@/lib/types";
import { useCart } from "@/store/cart";
import { useCatalog } from "@/store/catalog";
import { useFavorites } from "@/store/favorites";
import { useUI } from "@/store/ui";

type View = "obra" | "moldura" | "ambiente";
const VIEWS: Record<View, string> = { obra: "Obra", moldura: "Com moldura", ambiente: "No ambiente" };

export default function Product() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const artworks = useCatalog((s) => s.artworks);
  const addView = useCatalog((s) => s.addView);
  const art = artworks.find((a) => a.slug === slug);
  const addToCart = useCart((s) => s.add);
  const fav = useFavorites((s) => (art ? s.ids.includes(art.id) : false));
  const toggleFav = useFavorites((s) => s.toggle);
  const ui = useUI();

  const [sizeId, setSizeId] = useState<SizeId>("M");
  const [frame, setFrame] = useState<FrameId>("preta");
  const [view, setView] = useState<View>("obra");

  useEffect(() => {
    if (!art) return;
    setSizeId(art.sizes.find((s) => s.id === "M")?.id ?? art.sizes[0]?.id ?? "M");
    setFrame(art.frames.includes("preta") ? "preta" : art.frames[0] ?? "sem");
    const t = setTimeout(() => addView(art.id), 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [art?.id]);

  const related = useMemo(() => (art ? artworks.filter((a) => a.id !== art.id && (a.world === art.world || a.style === art.style)).slice(0, 4) : []), [art, artworks]);

  if (!art) {
    return (
      <div className="container-site py-28 text-center">
        <p className="display mb-4 text-5xl text-navy">Obra não encontrada</p>
        <Link href="/loja" className="btn-solid">Voltar à loja</Link>
      </div>
    );
  }

  const size = art.sizes.find((s) => s.id === sizeId) ?? art.sizes[0];
  const price = priceFor(art, sizeId, frame);
  const sold = art.status === "vendido";

  const cartItem = () => ({
    artworkId: art.id, slug: art.slug, title: art.title, artist: art.artist, image: art.image,
    sizeId, sizeLabel: sizeLabel(art, sizeId), frame, unitPrice: price,
  });
  const add = () => { addToCart(cartItem()); ui.set({ cartOpen: true }); };
  const buyNow = () => { addToCart(cartItem()); router.push("/checkout"); };

  return (
    <div className="container-site pb-24 pt-6 md:pt-10">
      <nav aria-label="Você está em" className="eyebrow mb-6 flex flex-wrap items-center gap-1.5 text-ink-mute md:mb-10">
        <Link href="/loja" className="hover:text-wave">Loja</Link><ChevronRight size={12} />
        <Link href={`/loja?mundo=${art.world}`} className="hover:text-wave">{WORLDS[art.world].label}</Link><ChevronRight size={12} />
        <span className="text-ink">{art.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
        {/* galeria */}
        <div>
          <div className="flex min-h-[320px] items-center justify-center bg-paper-light p-6 sm:p-12 lg:min-h-[640px]">
            {view === "obra" && (
              <div className="w-full shadow-frame" style={{ aspectRatio: RATIO[art.orientation], maxWidth: art.orientation === "retrato" ? 430 : 640 }}>
                <ZoomImage src={art.image} alt={art.title} />
              </div>
            )}
            {view === "moldura" && (
              <div className="w-full" style={{ maxWidth: art.orientation === "retrato" ? 430 : 640 }}>
                <Frame src={art.image} alt={art.title} orientation={art.orientation} frame={frame} eager />
              </div>
            )}
            {view === "ambiente" && (
              <div className="w-full"><RoomMockup src={art.image} alt={art.title} orientation={art.orientation} frame={frame} widthCm={size.w} heightCm={size.h} /></div>
            )}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3" role="tablist" aria-label="Visualizações">
            {(Object.keys(VIEWS) as View[]).map((v) => (
              <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)}
                className={cn("flex items-center gap-3 border-2 p-2 text-left transition-colors", view === v ? "border-navy bg-paper-light" : "border-transparent bg-paper-light/60 hover:border-ink/25")}>
                <ArtImage src={art.image} alt="" className="hidden h-12 w-12 shrink-0 sm:block" />
                <span className="eyebrow !text-[10px]">{VIEWS[v]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* compra */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className={cn("eyebrow inline-block px-2.5 py-1.5 !text-[10px] text-white", STATUS[art.status].tone)}>{STATUS[art.status].label}</span>
              <h1 className="display mt-4 text-[clamp(2.2rem,5vw,3.6rem)] text-navy">{art.title}</h1>
              <p className="mt-2 text-ink-soft">{art.artist}, {art.year} · {art.style}</p>
            </div>
            <button type="button" aria-pressed={fav} aria-label={fav ? "Remover dos favoritos" : "Salvar nos favoritos"}
              onClick={() => { toggleFav(art.id); ui.notify(fav ? "Removida dos favoritos" : "Salva nos favoritos"); }}
              className="grid h-12 w-12 shrink-0 place-items-center border border-ink/25 transition-colors hover:border-navy">
              <Heart size={19} className={fav ? "fill-sun text-sun" : ""} />
            </button>
          </div>

          <p className="mt-6 text-3xl font-semibold tabular-nums text-ink" aria-live="polite">{brl(price)}</p>
          <p className="mt-1 text-sm text-ink-mute">ou 10× de {brl(price / 10)} sem juros · 5% de desconto no Pix</p>

          <p className="mt-6 leading-relaxed text-ink-soft">{art.description}</p>

          <fieldset className="mt-8">
            <legend className="label">Tamanho <span className="ml-2 normal-case tracking-normal text-ink">{sizeLabel(art, sizeId)}</span></legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {art.sizes.map((s) => (
                <button key={s.id} type="button" aria-pressed={sizeId === s.id} onClick={() => setSizeId(s.id)}
                  className={cn("chip flex flex-col items-start !py-2.5", sizeId === s.id && "chip-on")}>
                  <span className="font-semibold">{SIZES[s.id].label}</span>
                  <span className="text-[11px] opacity-75">{s.id === "X" ? "sob medida" : `${s.w} × ${s.h} cm`}</span>
                </button>
              ))}
            </div>
            {sizeId === "X" && <p className="mt-2 text-xs text-ink-soft">Depois da compra, a galeria entra em contato para confirmar as medidas exatas (até 200 cm no maior lado).</p>}
          </fieldset>

          <fieldset className="mt-6">
            <legend className="label">Moldura <span className="ml-2 normal-case tracking-normal text-ink">{FRAMES[frame].label}</span></legend>
            <div className="flex flex-wrap gap-2">
              {art.frames.map((f) => (
                <button key={f} type="button" aria-pressed={frame === f} onClick={() => { setFrame(f); if (view === "obra") setView("moldura"); }}
                  className={cn("chip flex items-center gap-2.5", frame === f && "chip-on")}>
                  <span className="h-5 w-5 border border-ink/30" style={{ background: f === "sem" ? "repeating-linear-gradient(45deg,#fff 0 3px,#ccc 3px 4px)" : FRAMES[f].color }} />
                  {FRAMES[f].label}
                  <span className="text-[11px] opacity-70">{f === "sem" ? "" : `+ ${brl(priceFor(art, sizeId, f) - priceFor(art, sizeId, "sem"))}`}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={add} disabled={sold} className="btn-outline">{sold ? "Vendido" : "Adicionar ao carrinho"}</button>
            <button type="button" onClick={buyNow} disabled={sold} className="btn-solid">Comprar agora</button>
          </div>
          {art.status === "encomenda" && <p className="mt-3 text-sm text-ink-soft">Produzida sob encomenda: envio em até 20 dias úteis.</p>}
          {art.status === "disponivel" && art.stock > 0 && art.stock <= 3 && <p className="mt-3 text-sm text-sun">Restam apenas {art.stock} {art.stock === 1 ? "unidade" : "unidades"}.</p>}

          <ul className="mt-8 space-y-3 border-t border-ink/15 pt-6 text-sm text-ink-soft">
            <li className="flex gap-3"><Award size={18} className="mt-0.5 shrink-0 text-wave" /><span><strong className="text-ink">{art.edition}.</strong> Certificado de autenticidade numerado e assinado incluso.</span></li>
            <li className="flex gap-3"><ShieldCheck size={18} className="mt-0.5 shrink-0 text-wave" />Embalagem rígida com seguro total até a entrega.</li>
            <li className="flex gap-3"><Truck size={18} className="mt-0.5 shrink-0 text-wave" />Envio para todo o Brasil. Calcule o frete no carrinho.</li>
            <li className="flex gap-3"><RotateCcw size={18} className="mt-0.5 shrink-0 text-wave" />Devolução em até 7 dias após o recebimento.</li>
          </ul>

          <dl className="mt-6 divide-y divide-ink/10 border-y border-ink/15 text-sm">
            {[["Técnica", art.technique], ["Ano", art.year], ["Coleção", WORLDS[art.world].label], ["Edição", art.edition]].map(([k, v]) => (
              <div key={k as string} className="flex justify-between gap-6 py-2.5"><dt className="eyebrow text-ink-mute">{k}</dt><dd className="text-right">{v}</dd></div>
            ))}
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="display mb-10 text-4xl text-navy">Você também pode gostar</h2>
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4 lg:gap-x-8">{related.map((a) => <ArtCard key={a.id} art={a} />)}</div>
        </section>
      )}
    </div>
  );
}
