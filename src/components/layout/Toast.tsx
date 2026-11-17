"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useUI } from "@/store/ui";

export default function Toast() {
  const toast = useUI((s) => s.toast);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4" role="status" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
            className="eyebrow bg-navy px-5 py-3.5 text-paper-light shadow-xl">{toast}</motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
