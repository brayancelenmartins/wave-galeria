"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useEffect } from "react";
import { cartCount, useCart } from "@/store/cart";
import { useFavorites } from "@/store/favorites";
import { useUI } from "@/store/ui";
import { cn } from "@/lib/format";
import Logo from "./Logo";

export const NAV = [
  { href: "/loja", label: "Loja" },
  { href: "/colecao", label: "Coleção" },
  { href: "/galeria", label: "Galeria" },
  { href: "/sobre", label: "Sobre" },
];

export default function Header() {
  const pathname = usePathname();
  const count = useCart((s) => cartCount(s.items));
  const favs = useFavorites((s) => s.ids.length);
  const { menuOpen, set } = useUI();

  useEffect(() => { set({ menuOpen: false }); }, [pathname, set]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/") || (href === "/loja" && pathname.startsWith("/obra"));

  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur-md">
      <div className="container-site flex h-[72px] items-center gap-6 sm:h-[88px]">
        <Logo />
        <div className="hidden h-full flex-1 items-center justify-between border-b border-ink/60 md:flex">
          <nav aria-label="Principal" className="mx-auto flex h-full items-center gap-10 lg:gap-14">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} aria-current={isActive(n.href) ? "page" : undefined}
                className="eyebrow relative flex h-full items-center px-1 text-ink transition-colors hover:text-wave">
                {n.label}
                {isActive(n.href) && <motion.span layoutId="nav-underline" className="absolute inset-x-0 -bottom-px h-[3px] bg-wave" />}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <IconBtn label="Buscar" onClick={() => set({ searchOpen: true })}><Search size={19} /></IconBtn>
            <Link href="/favoritos" aria-label={`Favoritos (${favs})`} className="relative grid h-11 w-11 place-items-center transition-colors hover:text-wave">
              <Heart size={19} />{favs > 0 && <Badge n={favs} />}
            </Link>
            <IconBtn label={`Carrinho (${count} itens)`} onClick={() => set({ cartOpen: true })}>
              <ShoppingBag size={19} /><Badge n={count} />
            </IconBtn>
          </div>
        </div>
        {/* mobile */}
        <div className="ml-auto flex items-center md:hidden">
          <IconBtn label="Buscar" onClick={() => set({ searchOpen: true })}><Search size={20} /></IconBtn>
          <IconBtn label={`Carrinho (${count} itens)`} onClick={() => set({ cartOpen: true })}><ShoppingBag size={20} /><Badge n={count} /></IconBtn>
          <IconBtn label={menuOpen ? "Fechar menu" : "Abrir menu"} onClick={() => set({ menuOpen: !menuOpen })}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </IconBtn>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-ink/15 bg-paper md:hidden" aria-label="Menu"
          >
            <div className="container-site flex flex-col py-4">
              {[...NAV, { href: "/favoritos", label: `Favoritos${favs ? ` (${favs})` : ""}` }].map((n) => (
                <Link key={n.href} href={n.href}
                  className={cn("display border-b border-ink/10 py-4 text-3xl", isActive(n.href) ? "text-wave" : "text-navy")}>
                  {n.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="relative grid h-11 w-11 place-items-center transition-colors hover:text-wave">
      {children}
    </button>
  );
}

function Badge({ n }: { n: number }) {
  return (
    <span className="absolute right-0.5 top-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-ink px-1 text-[10px] font-bold text-paper-light">
      {n}
    </span>
  );
}
