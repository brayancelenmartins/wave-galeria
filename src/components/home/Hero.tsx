"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

/** Arte da referência como hero; os dois botões ficam na mesma posição do layout original. */
export default function Hero() {
  return (
    <section className="relative -mt-px overflow-hidden" aria-labelledby="hero-title">
      <h1 id="hero-title" className="sr-only">THE WAVE: galeria de arte e quadros em edição limitada</h1>
      <motion.div initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/hero.jpg" alt="Grande onda azul quebrando atrás do título THE WAVE pintado a pincel" width={2264} height={1208}
          className="mx-auto block w-full max-w-[1800px]" fetchPriority="high" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}
        className="container-site flex flex-col gap-3 pb-10 pt-2 sm:flex-row sm:justify-center md:absolute md:left-[51.5%] md:top-[70%] md:w-auto md:gap-2 md:p-0"
      >
        <Link href="/colecao" className="btn-solid md:px-[clamp(1rem,2vw,2rem)] md:py-[clamp(.7rem,1.1vw,1.1rem)]">
          Ver a coleção <ArrowRight size={18} className="arrow" />
        </Link>
        <Link href="/galeria" className="btn-outline md:px-[clamp(1rem,2vw,2rem)] md:py-[clamp(.7rem,1.1vw,1.1rem)]">
          Entrar na galeria <ArrowRight size={18} className="arrow" />
        </Link>
      </motion.div>
    </section>
  );
}
