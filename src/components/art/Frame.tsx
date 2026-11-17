import type { FrameId, Orientation } from "@/lib/types";
import { FRAMES } from "@/lib/constants";
import ArtImage from "./ArtImage";

export const RATIO: Record<Orientation, string> = { retrato: "5 / 7", paisagem: "7 / 5", quadrado: "1 / 1" };

/** Obra emoldurada. A espessura é proporcional à largura para funcionar em qualquer tamanho. */
export default function Frame({
  src, alt, orientation, frame = "preta", className = "", eager, thickness = 3.2,
}: { src: string; alt: string; orientation: Orientation; frame?: FrameId; className?: string; eager?: boolean; thickness?: number }) {
  const framed = frame !== "sem";
  return (
    <div className={`w-full ${className}`} style={{ containerType: "inline-size" }}>
      <div
        className="shadow-frame transition-[padding,background-color] duration-300"
        style={{
          aspectRatio: RATIO[orientation],
          padding: framed ? `${thickness}cqw` : 0,
          backgroundColor: framed ? FRAMES[frame].color : "transparent",
          backgroundImage: frame === "madeira" ? "repeating-linear-gradient(92deg, rgba(60,30,5,.18) 0 2px, transparent 2px 7px)" : undefined,
          boxShadow: frame === "branca" ? "0 18px 40px -18px rgba(15,21,28,.45), 0 0 0 1px rgba(15,21,28,.12)" : undefined,
        }}
      >
        <div className="h-full w-full bg-[#f7f4ec] transition-[padding] duration-300" style={{ padding: framed ? `${thickness * 1.4}cqw` : 0 }}>
          <ArtImage src={src} alt={alt} eager={eager} className="h-full w-full" />
        </div>
      </div>
    </div>
  );
}
