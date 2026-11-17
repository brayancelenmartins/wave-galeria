import Link from "next/link";
import { ArrowRight, Award, Frame as FrameIcon, Truck } from "lucide-react";
import Hero from "@/components/home/Hero";
import TrustStrip from "@/components/layout/TrustStrip";
import Featured from "@/components/home/Featured";
import WorldCards from "@/components/home/WorldCards";
import SectionTitle from "@/components/ui/SectionTitle";
import Reveal from "@/components/ui/Reveal";
import RoomMockup from "@/components/art/RoomMockup";

const PERKS = [
  { icon: Award, title: "Certificado de autenticidade", text: "Toda obra sai numerada e assinada, com certificado impresso dentro da embalagem." },
  { icon: FrameIcon, title: "Emoldurada à mão", text: "Molduras de madeira maciça, passe-partout livre de ácido e vidro antirreflexo." },
  { icon: Truck, title: "Envio seguro para todo o Brasil", text: "Embalagem rígida com cantoneiras e seguro total do ateliê até a sua parede." },
];

export default function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />

      <section className="container-site py-20 md:py-28">
        <SectionTitle title="Em evidência"
          action={<Link href="/loja" className="btn-outline">Ver todas as obras <ArrowRight size={16} className="arrow" /></Link>} />
        <Featured />
      </section>

      <section className="bg-wave-pale py-20 md:py-28">
        <div className="container-site">
          <SectionTitle title="Choose your world" sub="Escolha seu mundo" />
          <WorldCards />
        </div>
      </section>

      <section className="container-site grid items-center gap-12 py-20 md:py-28 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <RoomMockup src="/img/art/art-hokusai.jpg" alt="A Grande Onda, Releitura" orientation="paisagem" frame="preta" widthCm={110} heightCm={80} caption={false} />
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="display text-[clamp(2.4rem,5vw,4.5rem)] text-navy">A série da onda</h2>
          <p className="mt-6 max-w-md leading-relaxed text-ink-soft">
            Oito peças que partem da gravura japonesa e chegam ao azul que virou a nossa marca. Escolha o tamanho, a moldura e
            veja a obra em escala antes de comprar.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/loja?mundo=japao" className="btn-solid">Ver a série <ArrowRight size={16} className="arrow" /></Link>
            <Link href="/obra/a-grande-onda-releitura" className="btn-outline">Ver esta obra</Link>
          </div>
        </Reveal>
      </section>

      <section className="border-t border-ink/15">
        <div className="container-site grid gap-10 py-16 md:grid-cols-3 md:py-20">
          {PERKS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <p.icon size={26} strokeWidth={1.5} className="text-wave" />
              <h3 className="mt-4 font-display text-xl font-medium uppercase tracking-wide text-navy">{p.title}</h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">{p.text}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
