"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { Artwork } from "@/lib/types";
import { STATUS } from "@/lib/constants";
import { brl, cn } from "@/lib/format";
import { priceFrom } from "@/lib/pricing";
import { useFavorites } from "@/store/favorites";
import { useUI } from "@/store/ui";
import Frame from "./Frame";

export default function ArtCard({ art }: { art: Artwork }) {
  const fav = useFavorites((s) => s.ids.includes(art.id));
  const toggle = useFavorites((s) => s.toggle);
  const notify = useUI((s) => s.notify);
  const sold = art.status === "vendido";

  return (
    <article className="group relative">
      <Link href={`/obra/${art.slug}`} className="block" aria-label={`${art.title}, de ${art.artist}`}>
        <div className="relative flex aspect-[4/5] items-center justify-center bg-paper-light p-[11%] transition-colors duration-300 group-hover:bg-white/70">
          <div className={cn("w-full transition-transform duration-500 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.02]",
            art.orientation === "retrato" && "max-w-[78%]", sold && "opacity-70 grayscale-[35%]")}>
            <Frame src={art.image} alt={art.title} orientation={art.orientation} />
          </div>
          {art.status !== "disponivel" && (
            <span className={cn("eyebrow absolute left-3 top-3 px-2.5 py-1.5 !text-[10px] text-white", STATUS[art.status].tone)}>
              {STATUS[art.status].label}
            </span>
          )}
        </div>
        <div className="mt-4 flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h3 className="truncate font-display text-xl font-medium uppercase tracking-wide text-navy">{art.title}</h3>
            <p className="mt-0.5 text-sm text-ink-mute">{art.artist} · {art.style}</p>
          </div>
          <p className="shrink-0 text-sm sm:text-right">
            {sold ? <span className="text-ink-mute line-through">{brl(priceFrom(art))}</span> : <span className="font-semibold text-ink">{brl(priceFrom(art))}</span>}
          </p>
        </div>
      </Link>
      <button
        type="button"
        onClick={() => { toggle(art.id); notify(fav ? "Removida dos favoritos" : "Salva nos favoritos"); }}
        aria-label={fav ? "Remover dos favoritos" : "Salvar nos favoritos"}
        aria-pressed={fav}
        className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-paper/80 text-navy backdrop-blur transition hover:bg-navy hover:text-paper-light"
      >
        <Heart size={17} className={fav ? "fill-sun text-sun" : ""} />
      </button>
    </article>
  );
}
