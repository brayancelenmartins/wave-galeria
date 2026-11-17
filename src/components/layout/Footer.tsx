"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useUI } from "@/store/ui";
import { NAV } from "./Header";
import Logo from "./Logo";

export default function Footer() {
  const notify = useUI((s) => s.notify);
  const [email, setEmail] = useState("");
  return (
    <footer className="bg-navy-deep text-paper-light">
      <div className="container-site grid gap-12 py-16 md:grid-cols-[1.3fr_1fr_1fr_1.4fr]">
        <div>
          <Logo light />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-paper-light/70">
            Galeria e loja de arte para parede. Edições limitadas e obras originais, emolduradas à mão e enviadas para todo o Brasil.
          </p>
        </div>
        <FooterCol title="Navegar" links={NAV} />
        <FooterCol title="Atendimento" links={[
          { href: "/sobre#envio", label: "Envio e prazos" },
          { href: "/sobre#certificado", label: "Certificado de autenticidade" },
          { href: "/favoritos", label: "Favoritos" },
          { href: "/admin", label: "Painel administrativo" },
        ]} />
        <form
          onSubmit={(e) => { e.preventDefault(); notify("Inscrição confirmada. Até a próxima coleção!"); setEmail(""); }}
        >
          <p className="eyebrow mb-4 text-wave-light">Novas obras por e-mail</p>
          <label htmlFor="news" className="sr-only">Seu e-mail</label>
          <div className="flex border-b border-paper-light/50">
            <input id="news" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com"
              className="min-w-0 flex-1 bg-transparent py-3 text-sm placeholder:text-paper-light/40 focus:outline-none" />
            <button type="submit" aria-label="Inscrever" className="px-2 transition-colors hover:text-wave-light"><ArrowRight size={18} /></button>
          </div>
        </form>
      </div>
      <div className="border-t border-paper-light/15">
        <div className="container-site flex flex-wrap justify-between gap-2 py-5 text-xs text-paper-light/50">
          <span>© 2026 THE WAVE. Todos os direitos reservados.</span>
          <span>Cuiabá · Brasil</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="eyebrow mb-4 text-wave-light">{title}</p>
      <ul className="space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href}><Link href={l.href} className="text-paper-light/80 transition-colors hover:text-white">{l.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
