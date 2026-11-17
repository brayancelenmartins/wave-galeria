"use client";
import { useRef, useState } from "react";
import { ZoomIn } from "lucide-react";
import ArtImage from "./ArtImage";

/** Zoom por lupa: passe o mouse (ou toque) para ampliar 2,4×. */
export default function ZoomImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  const move = (cx: number, cy: number) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos({ x: Math.max(0, Math.min(100, ((cx - r.left) / r.width) * 100)), y: Math.max(0, Math.min(100, ((cy - r.top) / r.height) * 100)) });
  };

  return (
    <div
      ref={ref}
      className={`relative h-full w-full overflow-hidden ${zoom ? "cursor-zoom-out" : "cursor-zoom-in"}`}
      onMouseEnter={() => setZoom(true)}
      onMouseLeave={() => setZoom(false)}
      onMouseMove={(e) => move(e.clientX, e.clientY)}
      onClick={(e) => { move(e.clientX, e.clientY); if (matchMedia("(hover: none)").matches) setZoom((z) => !z); }}
      onTouchMove={(e) => zoom && move(e.touches[0].clientX, e.touches[0].clientY)}
    >
      <div
        className="h-full w-full transition-transform duration-200 ease-out"
        style={{ transform: zoom ? "scale(2.4)" : "scale(1)", transformOrigin: `${pos.x}% ${pos.y}%` }}
      >
        <ArtImage src={src} alt={alt} eager className="h-full w-full" />
      </div>
      {!zoom && (
        <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 bg-paper/90 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-caps text-navy">
          <ZoomIn size={13} /> Zoom
        </span>
      )}
    </div>
  );
}
