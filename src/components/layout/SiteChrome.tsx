"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import SearchOverlay from "./SearchOverlay";
import WorldTransition from "./WorldTransition";

/** Cabeçalho, rodapé, carrinho e busca da área pública (o admin tem layout próprio). */
export default function SiteChrome({ children }: { children: ReactNode }) {
  const admin = usePathname().startsWith("/admin");
  if (admin) return <>{children}</>;
  return (
    <>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-navy focus:px-4 focus:py-2 focus:text-paper-light">Pular para o conteúdo</a>
      <Header />
      <main id="conteudo" className="min-h-[60vh]">{children}</main>
      <Footer />
      <CartDrawer />
      <SearchOverlay />
      <WorldTransition />
    </>
  );
}
