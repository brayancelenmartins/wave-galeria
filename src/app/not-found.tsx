import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-site py-28 text-center">
      <p className="display text-[clamp(5rem,18vw,12rem)] text-navy">404</p>
      <p className="mb-8 text-ink-soft">Esta página foi levada pela maré.</p>
      <Link href="/" className="btn-solid">Voltar ao início</Link>
    </div>
  );
}
