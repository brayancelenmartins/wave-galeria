import { FRAMES, SIZES } from "./constants";
import type { Artwork, FrameId, SizeId } from "./types";

/** Preço final de uma obra para o tamanho e a moldura escolhidos. */
export function priceFor(art: Pick<Artwork, "basePrice">, sizeId: SizeId, frame: FrameId): number {
  const m = SIZES[sizeId].multiplier;
  const artPrice = art.basePrice * m;
  // moldura acompanha o tamanho da obra
  const framePrice = FRAMES[frame].price * (0.6 + m * 0.4);
  return Math.round((artPrice + framePrice) / 10) * 10;
}

/** Menor preço possível (usado nos cards: "a partir de"). */
export function priceFrom(art: Artwork): number {
  if (!art.sizes.length) return art.basePrice;
  return Math.min(...art.sizes.map((s) => priceFor(art, s.id, "sem")));
}

export function sizeLabel(art: Artwork, sizeId: SizeId): string {
  const s = art.sizes.find((x) => x.id === sizeId);
  const name = SIZES[sizeId].label;
  if (!s) return name;
  return sizeId === "X" ? `${name} (a partir de ${s.w} × ${s.h} cm)` : `${name} · ${s.w} × ${s.h} cm`;
}
