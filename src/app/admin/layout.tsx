"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Image as ImageIcon, LayoutDashboard, LogOut, Package } from "lucide-react";
import type { ReactNode } from "react";
import AdminGate from "@/components/admin/AdminGate";
import Logo from "@/components/layout/Logo";
import { cn } from "@/lib/format";

const LINKS = [
  { href: "/admin", label: "Métricas", icon: LayoutDashboard },
  { href: "/admin/obras", label: "Obras", icon: ImageIcon },
  { href: "/admin/pedidos", label: "Pedidos", icon: Package },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const item = "flex shrink-0 items-center gap-3 px-4 py-3 text-sm font-medium transition-colors";
  return (
    <AdminGate>
      {(logout) => (
        <div className="min-h-screen bg-paper-light lg:grid lg:grid-cols-[240px_1fr]">
          <aside className="bg-navy-deep text-paper-light lg:sticky lg:top-0 lg:h-screen">
            <div className="px-5 py-4 lg:py-7"><Logo light /></div>
            <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:pb-0">
              {LINKS.map(({ href, label, icon: Icon }) => {
                const on = pathname === href;
                return (
                  <Link key={href} href={href} aria-current={on ? "page" : undefined}
                    className={cn(item, on ? "bg-wave text-white" : "text-paper-light/75 hover:bg-white/10")}>
                    <Icon size={17} /> {label}
                  </Link>
                );
              })}
              <Link href="/" className={cn(item, "text-paper-light/75 hover:bg-white/10 lg:mt-6")}><ExternalLink size={17} /> Ver a loja</Link>
              {logout && <button type="button" onClick={logout} className={cn(item, "text-left text-paper-light/75 hover:bg-white/10")}><LogOut size={17} /> Sair</button>}
            </nav>
          </aside>
          <main className="min-w-0 p-5 sm:p-8 lg:p-12">{children}</main>
        </div>
      )}
    </AdminGate>
  );
}
