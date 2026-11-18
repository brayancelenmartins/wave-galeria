"use client";
import type { FrameId, Orientation } from "@/lib/types";
import Frame, { RATIO } from "./Frame";

/**
 * Cena real (public/img/ambiente/sala.jpg) com a obra pendurada em escala.
 * Medidas em pixels da foto recortada (1126 × 1190):
 * o aparador tem ~150 cm e ocupa 612 px, logo ~4,05 px por centímetro.
 */
const SCENE = { src: "/img/ambiente/sala.jpg", w: 1126, h: 1190 };
const PX_PER_CM = 4.05;
const CENTER_X = 574; // centro do aparador
const EYE_Y = 468; // ~145 cm do chão: centro ideal da obra
const MAX_BOTTOM_Y = 660; // logo acima da tampa do toca-discos
const MIN_TOP_Y = 72; // abaixo do rodaforro
const MAX_W = SCENE.w * 0.92;

const ratioOf = (o: Orientation) => {
  const [a, b] = RATIO[o].split("/").map((n) => Number(n.trim()));
  return b / a; // altura / largura da moldura desenhada
};

export default function RoomMockup({ src, alt, orientation, frame, widthCm, heightCm, caption = true }:
  { src: string; alt: string; orientation: Orientation; frame: FrameId; widthCm: number; heightCm: number; caption?: boolean }) {
  // tamanho em pixels da cena, limitado ao espaço livre da parede
  let w = widthCm * PX_PER_CM;
  let h = w * ratioOf(orientation);
  const maxH = MAX_BOTTOM_Y - MIN_TOP_Y;
  const fit = Math.min(1, MAX_W / w, maxH / h);
  w *= fit; h *= fit;

  // centro na altura dos olhos; se encostaria nos objetos do aparador, sobe
  const bottom = Math.min(EYE_Y + h / 2, MAX_BOTTOM_Y);

  const pct = (v: number, total: number) => `${(v / total) * 100}%`;

  return (
    <figure>
      <div className="relative w-full overflow-hidden bg-[#c9b79c]" style={{ aspectRatio: `${SCENE.w} / ${SCENE.h}`, containerType: "inline-size" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={SCENE.src} alt="Sala com aparador, toca-discos e planta" className="absolute inset-0 h-full w-full object-cover" />
        <div
          className="absolute transition-all duration-500 ease-out"
          style={{
            left: pct(CENTER_X - w / 2, SCENE.w),
            bottom: pct(SCENE.h - bottom, SCENE.h),
            width: pct(w, SCENE.w),
            // sombra suave na parede, luz vindo da frente e da esquerda como na foto
            filter: "drop-shadow(0.6cqw 0.9cqw 1.1cqw rgba(45,28,12,.45))",
          }}
        >
          <div className="relative">
            <Frame src={src} alt={alt} orientation={orientation} frame={frame} thickness={2.6} className="[&>div]:!shadow-none" />
            {/* tom quente da luz da sala sobre a obra */}
            <div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-multiply"
              style={{ background: "linear-gradient(115deg, rgba(255,226,190,.55), rgba(236,196,150,.6) 60%, rgba(200,160,120,.65))" }} />
            <div aria-hidden className="pointer-events-none absolute inset-0"
              style={{ background: "linear-gradient(115deg, rgba(255,240,220,.08), transparent 45%)" }} />
          </div>
        </div>
      </div>
      {caption && (
        <figcaption className="mt-3 flex justify-between text-xs text-ink-mute">
          <span>Obra com {widthCm} × {heightCm} cm</span><span>Aparador de referência: 150 cm</span>
        </figcaption>
      )}
    </figure>
  );
}
