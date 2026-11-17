"use client";
import type { FrameId, Orientation } from "@/lib/types";
import Frame from "./Frame";

/**
 * Simulação da obra em uma sala. A cena representa 300 cm de parede;
 * o sofá tem 200 cm, então a largura do quadro fica em escala real.
 */
export default function RoomMockup({ src, alt, orientation, frame, widthCm, heightCm, caption = true }:
  { src: string; alt: string; orientation: Orientation; frame: FrameId; widthCm: number; heightCm: number; caption?: boolean }) {
  const SCENE = 300;
  const pct = Math.min(62, (widthCm / SCENE) * 100);
  return (
    <figure>
      <div className="relative aspect-[4/3] overflow-hidden bg-[#e9e4d8]">
        {/* parede e piso */}
        <div className="absolute inset-x-0 bottom-0 h-[20%] bg-[#b89a74]" style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,.07) 0 1px, transparent 1px 90px)" }} />
        <div className="absolute inset-x-0 bottom-[20%] h-[1.6%] bg-[#f4f1e8]" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/10" />
        {/* obra: base alinhada ~25 cm acima do sofá */}
        <div className="absolute left-1/2 bottom-[53%] -translate-x-1/2 transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }}>
          <Frame src={src} alt={alt} orientation={orientation} frame={frame} thickness={2.6} />
        </div>
        {/* sofá (200 cm) */}
        <div className="absolute bottom-[12%] left-1/2 w-[66.6%] -translate-x-1/2">
          <div className="mx-[3%] h-[7vw] max-h-16 min-h-8 rounded-t-xl bg-[#27466b]" />
          <div className="-mt-1 h-[5vw] max-h-12 min-h-6 rounded-xl bg-[#1d3757] shadow-[0_14px_18px_-10px_rgba(0,0,0,.5)]" />
          <div className="flex justify-between px-[6%]"><span className="h-3 w-1.5 bg-[#6b4a28]" /><span className="h-3 w-1.5 bg-[#6b4a28]" /></div>
        </div>
        {/* planta */}
        <div className="absolute bottom-[14%] right-[5%] flex flex-col items-center">
          <div className="h-16 w-10 rounded-[50%_50%_45%_45%] bg-[#4d6b3a] sm:h-24 sm:w-14" />
          <div className="-mt-2 h-8 w-7 rounded-b-lg bg-[#d8d2c4] sm:h-10 sm:w-9" />
        </div>
      </div>
      {caption && (
        <figcaption className="mt-3 flex justify-between text-xs text-ink-mute">
          <span>Obra com {widthCm} × {heightCm} cm</span><span>Sofá de referência: 200 cm</span>
        </figcaption>
      )}
    </figure>
  );
}
