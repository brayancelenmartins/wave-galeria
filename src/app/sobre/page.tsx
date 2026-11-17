import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PageHead from "@/components/ui/PageHead";
import ArtImage from "@/components/art/ArtImage";

export const metadata: Metadata = { title: "Sobre" };

const BLOCKS = [
  { id: "certificado", title: "Certificado de autenticidade", text: "Cada obra recebe numeração, assinatura e um certificado impresso em papel algodão com selo holográfico. O registro fica guardado no ateliê e pode ser consultado pelo número da peça." },
  { id: "moldura", title: "Molduras", text: "Trabalhamos com três acabamentos em madeira maciça (preta, branca e natural), passe-partout livre de ácido e vidro antirreflexo com proteção UV. Também enviamos a obra sem moldura, enrolada em tubo rígido." },
  { id: "envio", title: "Envio e prazos", text: "Obras disponíveis saem do ateliê em até 5 dias úteis. Peças sob encomenda levam até 20 dias de produção. O frete é calculado pelo CEP e é gratuito em compras acima de R$ 5.000." },
];

export default function SobrePage() {
  return (
    <>
      <PageHead title="Sobre" />
      <div className="container-site grid gap-12 pb-24 lg:grid-cols-2 lg:gap-20">
        <ArtImage src="/img/art/tiger-edge.jpg" alt="Detalhe da obra Tigre entre Ameixeiras" className="aspect-[6/7] w-full shadow-frame" />
        <div>
          <p className="max-w-lg text-lg leading-relaxed text-ink-soft">
            THE WAVE nasceu de uma gravura: a onda que atravessou dois séculos e continua quebrando. Somos uma galeria e
            loja de arte para parede. Publicamos edições limitadas e representamos artistas independentes. Tudo é impresso, montado e conferido à mão
            antes de sair do ateliê. 100% Brasil, do papel à moldura.
          </p>
          <div className="mt-10 divide-y divide-ink/15 border-y border-ink/15">
            {BLOCKS.map((b) => (
              <section key={b.id} id={b.id} className="scroll-mt-28 py-7">
                <h2 className="font-display text-2xl font-medium uppercase tracking-wide text-navy">{b.title}</h2>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-soft">{b.text}</p>
              </section>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/loja" className="btn-solid">Ir para a loja <ArrowRight size={16} className="arrow" /></Link>
            <a href="mailto:contato@thewave.art.br" className="btn-outline">Falar com a galeria</a>
          </div>
        </div>
      </div>
    </>
  );
}
