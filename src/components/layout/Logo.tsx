import Link from "next/link";

/** Logo WAVE. `light` inverte para branco em fundos escuros. */
export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="block shrink-0" aria-label="WAVE, página inicial">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/img/logo.png" alt="WAVE" width={640} height={430} className={`h-[52px] w-auto sm:h-[66px] ${light ? "invert" : ""}`} />
    </Link>
  );
}
