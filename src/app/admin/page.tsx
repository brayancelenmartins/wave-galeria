"use client";
import Link from "next/link";
import { useMemo } from "react";
import { BarChart, compactBRL, RankBars } from "@/components/admin/Charts";
import { ORDER_STATUS } from "@/lib/constants";
import { brl, dateBR } from "@/lib/format";
import { useCatalog } from "@/store/catalog";
import { useOrders } from "@/store/orders";

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export default function AdminDashboard() {
  const orders = useOrders((s) => s.orders);
  const artworks = useCatalog((s) => s.artworks);

  const m = useMemo(() => {
    // últimos 6 meses a partir do pedido mais recente
    const last = orders.length ? new Date(orders[0].createdAt) : new Date();
    const buckets = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(Date.UTC(last.getUTCFullYear(), last.getUTCMonth() - (5 - i), 1));
      return { key: `${d.getUTCFullYear()}-${d.getUTCMonth()}`, label: MONTHS[d.getUTCMonth()], revenue: 0, count: 0 };
    });
    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      const b = buckets.find((x) => x.key === `${d.getUTCFullYear()}-${d.getUTCMonth()}`);
      if (b) { b.revenue += o.total; b.count += 1; }
    });
    const revenue = orders.reduce((n, o) => n + o.total, 0);
    const cur = buckets[5].revenue, prev = buckets[4].revenue;
    return {
      buckets, revenue, cur,
      delta: prev ? Math.round(((cur - prev) / prev) * 100) : null,
      ticket: orders.length ? revenue / orders.length : 0,
      pending: orders.filter((o) => o.status === "pago" || o.status === "producao").length,
    };
  }, [orders]);

  const viewed = [...artworks].sort((a, b) => b.views - a.views).slice(0, 6).map((a) => ({ label: a.title, value: a.views }));

  const kpis = [
    { label: "Faturamento total", value: brl(m.revenue), note: `${orders.length} pedidos` },
    { label: `Faturamento em ${m.buckets[5].label}`, value: brl(m.cur), note: m.delta === null ? "" : `${m.delta >= 0 ? "+" : ""}${m.delta}% contra ${m.buckets[4].label}` },
    { label: "Ticket médio", value: brl(Math.round(m.ticket)), note: "por pedido" },
    { label: "Pedidos a despachar", value: String(m.pending), note: "pagos ou em produção" },
  ];

  return (
    <div className="max-w-6xl">
      <h1 className="display text-5xl text-navy">Métricas</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="border border-ink/15 bg-white/60 p-5">
            <p className="eyebrow text-ink-mute">{k.label}</p>
            <p className="mt-3 text-3xl font-semibold tabular-nums text-navy">{k.value}</p>
            <p className="mt-1 text-xs text-ink-mute">{k.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Faturamento mensal"><BarChart label="Faturamento mensal" data={m.buckets.map((b) => ({ label: b.label, value: b.revenue }))} format={compactBRL} /></Card>
        <Card title="Vendas por mês (pedidos)"><BarChart label="Pedidos por mês" data={m.buckets.map((b) => ({ label: b.label, value: b.count }))} /></Card>
        <Card title="Obras mais visualizadas"><RankBars data={viewed} unit="views" /></Card>
        <Card title="Pedidos recentes" action={<Link href="/admin/pedidos" className="text-xs font-semibold text-wave hover:underline">Ver todos</Link>}>
          <ul className="divide-y divide-ink/10 text-sm">
            {orders.slice(0, 6).map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="min-w-0"><span className="font-semibold">{o.id}</span> <span className="text-ink-mute">· {o.customer.name} · {dateBR(o.createdAt)}</span></span>
                <span className={`shrink-0 px-2 py-1 text-[11px] font-semibold ${ORDER_STATUS[o.status].tone}`}>{ORDER_STATUS[o.status].label.split(" /")[0]}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border border-ink/15 bg-white/60 p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between"><h2 className="font-display text-xl font-medium uppercase tracking-wide text-navy">{title}</h2>{action}</div>
      {children}
    </section>
  );
}
