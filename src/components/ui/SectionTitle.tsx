import type { ReactNode } from "react";

/** Título no estilo "—CHOOSE YOUR WORLD—" da referência. */
export default function SectionTitle({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-14">
      <div>
        <h2 className="display flex items-center gap-3 text-navy text-[clamp(2.4rem,6vw,5rem)]">
          <span className="hidden h-[3px] w-10 bg-navy sm:block md:w-16" />
          {title}
        </h2>
        {sub && <p className="mt-3 font-display text-xl font-medium uppercase tracking-wide text-ink-soft sm:ml-[3.25rem] md:ml-[4.75rem] md:text-2xl">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
