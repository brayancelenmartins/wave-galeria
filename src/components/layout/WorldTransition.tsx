"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { World } from "@/lib/types";
import { WORLDS } from "@/lib/constants";
import { useUI } from "@/store/ui";

const THEME: Record<World, { bg: string; fg: string; accent: string }> = {
  japao: { bg: "#0C2543", fg: "#EFE9DC", accent: "#C8372D" },
  brasil: { bg: "#1E6B3C", fg: "#F4D53B", accent: "#F4D53B" },
  usa: { bg: "#B4262D", fg: "#FFFFFF", accent: "#1C2B63" },
};

/**
 * Transição de "Choose your world": a cor do mundo se abre em círculo a partir do clique,
 * o nome entra letra a letra, a loja carrega por baixo e a cortina sobe.
 */
export default function WorldTransition() {
  const world = useUI((s) => s.world);
  const set = useUI((s) => s.set);
  const router = useRouter();

  useEffect(() => {
    if (!world) return;
    document.body.style.overflow = "hidden";
    const go = setTimeout(() => router.push(`/loja?mundo=${world.id}`), 750);
    const end = setTimeout(() => set({ world: null }), 1650);
    return () => { clearTimeout(go); clearTimeout(end); document.body.style.overflow = ""; };
  }, [world, router, set]);

  return (
    <AnimatePresence>
      {world && (
        <motion.div
          key={world.id}
          aria-hidden
          className="fixed inset-0 z-[80] grid place-items-center overflow-hidden"
          style={{ backgroundColor: THEME[world.id].bg, color: THEME[world.id].fg }}
          initial={{ clipPath: `circle(0% at ${world.x}px ${world.y}px)` }}
          animate={{ clipPath: `circle(150% at ${world.x}px ${world.y}px)` }}
          exit={{ y: "-100%", transition: { duration: 0.65, ease: [0.76, 0, 0.24, 1] } }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="text-center">
            <p className="display flex justify-center overflow-hidden text-[clamp(4.5rem,20vw,16rem)]">
              {WORLDS[world.id].label.split("").map((ch, i) => (
                <motion.span key={i} className="inline-block" initial={{ y: "110%" }} animate={{ y: 0 }}
                  transition={{ delay: 0.25 + i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>{ch}</motion.span>
              ))}
            </p>
            <svg viewBox="0 0 400 24" className="mx-auto mt-2 w-[min(70vw,520px)]" fill="none">
              <motion.path d="M4 12 Q 29 -6 54 12 T 104 12 T 154 12 T 204 12 T 254 12 T 304 12 T 354 12 T 396 12"
                stroke={THEME[world.id].accent} strokeWidth="5" strokeLinecap="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.35, duration: 0.7, ease: "easeInOut" }} />
            </svg>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
