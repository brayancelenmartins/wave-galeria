"use client";
import { useEffect, useState } from "react";

const PALETTES = [
  ["#0C2543", "#1B6FC2", "#5FA8E0", "#EFE9DC", "#C8372D"],
  ["#1d3b2a", "#779442", "#e0c341", "#EFE9DC", "#d9623b"],
  ["#2b2540", "#327590", "#8fb6d6", "#EFE9DC", "#b0413e"],
];

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Composição abstrata gerada a partir do título: usada quando a imagem não carrega (ex.: sem internet). */
function GeneratedArt({ seed }: { seed: string }) {
  let h = hash(seed);
  const rnd = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0), (h % 1000) / 1000);
  const p = PALETTES[hash(seed) % PALETTES.length];
  const shapes = Array.from({ length: 7 }, (_, i) => ({
    cx: rnd() * 100, cy: rnd() * 100, r: 12 + rnd() * 34, fill: p[(i + 1) % p.length], o: 0.55 + rnd() * 0.45,
  }));
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="h-full w-full" role="img" aria-label={seed}>
      <rect width="100" height="100" fill={p[3]} />
      {shapes.map((s, i) => <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={s.fill} opacity={s.o} />)}
      <path d={`M0 ${60 + rnd() * 20} Q 25 ${40 + rnd() * 20} 50 ${62 + rnd() * 16} T 100 ${58 + rnd() * 20} V100 H0Z`} fill={p[0]} opacity=".9" />
    </svg>
  );
}

export default function ArtImage({ src, alt, className = "", eager }: { src: string; alt: string; className?: string; eager?: boolean }) {
  const [failed, setFailed] = useState(!src);
  useEffect(() => setFailed(!src), [src]);
  if (failed) return <div className={className}><GeneratedArt seed={alt} /></div>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} onError={() => setFailed(true)} className={`${className} object-cover`} />;
}
