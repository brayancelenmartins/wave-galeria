"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { MouseEvent } from "react";
import type { World } from "@/lib/types";
import { WORLDS } from "@/lib/constants";
import { useUI } from "@/store/ui";

/** "Choose your world": cada mundo abre a loja filtrada, com uma transição de tela cheia. */
export default function WorldCards({ worlds = ["brasil", "usa"] }: { worlds?: World[] }) {
  const enter = useUI((s) => s.enterWorld);

  const onClick = (e: MouseEvent, w: World) => {
    // abrir em nova aba ou movimento reduzido: navegação normal, sem animação
    if (e.metaKey || e.ctrlKey || e.shiftKey || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    e.preventDefault();
    enter(w, e.clientX, e.clientY);
  };

  return (
    <div className={`grid gap-5 sm:gap-8 ${worlds.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
      {worlds.map((w, i) => (
        <motion.div key={w} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.6 }}>
          <Link href={`/loja?mundo=${w}`} onClick={(e) => onClick(e, w)}
            className="group block overflow-hidden rounded-[28px] bg-white/45 ring-1 ring-navy/10 transition hover:bg-white/80 hover:ring-navy/30">
            <div className="aspect-square overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={WORLDS[w].image} alt={`Colagem do mundo ${WORLDS[w].label}`} loading="lazy"
                className="h-full w-full object-cover mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-105" />
            </div>
            <div className="flex items-center justify-between gap-4 p-6 sm:p-7">
              <h3 className="display text-4xl text-[#2c2a4a] sm:text-5xl">{WORLDS[w].label}</h3>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#2c2a4a] text-white transition-transform group-hover:translate-x-1">
                <ArrowRight size={20} />
              </span>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
