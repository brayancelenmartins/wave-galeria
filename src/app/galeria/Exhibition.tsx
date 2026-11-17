"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useCatalog } from "@/store/catalog";
import { STATUS, WORLD_IDS, WORLDS } from "@/lib/constants";
import type { World } from "@/lib/types";
import { cn } from "@/lib/format";
import Frame from "@/components/art/Frame";
import Reveal from "@/components/ui/Reveal";

export default function Exhibition() {
  const artworks = useCatalog((s) => s.artworks);
  const [room, setRoom] = useState<World | "todas">("todas");
  const list = artworks.filter((a) => room === "todas" || a.world === room);

  return (
    <div className="pb-24">
      <div className="container-site mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Salas">
        {(["todas", ...WORLD_IDS] as const).map((w) => (
          <button key={w} role="tab" aria-selected={room === w} onClick={() => setRoom(w)} className={cn("chip", room === w && "chip-on")}>
            {w === "todas" ? "Todas as salas" : `Sala ${WORLDS[w].label}`}
          </button>
        ))}
      </div>
      {list.map((a, i) => (
        <section key={a.id} className={cn("border-t border-ink/10", i % 2 ? "bg-paper-light/60" : "")}>
          <div className={cn("container-site grid items-center gap-8 py-14 md:grid-cols-12 md:gap-12 md:py-24")}>
            <Reveal className={cn("md:col-span-7", i % 2 === 1 && "md:order-2")}>
              <Link href={`/obra/${a.slug}`} className="mx-auto block transition-transform duration-500 hover:scale-[1.015]"
                style={{ maxWidth: a.orientation === "paisagem" ? 640 : a.orientation === "quadrado" ? 480 : 400 }}>
                <Frame src={a.image} alt={a.title} orientation={a.orientation} eager={i < 2} />
              </Link>
            </Reveal>
            <Reveal delay={0.1} className="md:col-span-5">
              <h2 className="display text-4xl text-navy md:text-5xl">{a.title}</h2>
              <p className="mt-2 text-ink-soft">{a.artist}, {a.year}</p>
              <dl className="mt-6 max-w-sm divide-y divide-ink/10 border-y border-ink/10 text-sm">
                {[["Técnica", a.technique], ["Edição", a.edition], ["Situação", STATUS[a.status].label]].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-6 py-2.5"><dt className="eyebrow text-ink-mute">{k}</dt><dd className="text-right">{v}</dd></div>
                ))}
              </dl>
              <Link href={`/obra/${a.slug}`} className="btn-outline mt-7">Ver obra <ArrowRight size={16} className="arrow" /></Link>
            </Reveal>
          </div>
        </section>
      ))}
      {list.length === 0 && <p className="container-site py-20 text-ink-soft">Esta sala está sendo montada. Volte em breve.</p>}
    </div>
  );
}
