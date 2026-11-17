"use client";
import { ChevronDown } from "lucide-react";
import { Fragment, useState } from "react";
import { FRAMES, ORDER_STATUS, ORDER_STATUS_IDS, PAYMENTS } from "@/lib/constants";
import { brl, cn, dateBR } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";
import { useOrders } from "@/store/orders";
import { useUI } from "@/store/ui";

export default function AdminOrders() {
  const { orders, setStatus } = useOrders();
  const notify = useUI((s) => s.notify);
  const [filter, setFilter] = useState<OrderStatus | "todos">("todos");
  const [open, setOpen] = useState<string | null>(null);
  const list = orders.filter((o) => filter === "todos" || o.status === filter);

  return (
    <div className="max-w-6xl">
      <h1 className="display text-5xl text-navy">Pedidos</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        {(["todos", ...ORDER_STATUS_IDS] as const).map((s) => (
          <button key={s} type="button" aria-pressed={filter === s} onClick={() => setFilter(s)} className={cn("chip bg-white/60", filter === s && "chip-on")}>
            {s === "todos" ? "Todos" : ORDER_STATUS[s].label.split(" /")[0]} ({s === "todos" ? orders.length : orders.filter((o) => o.status === s).length})
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto border border-ink/15 bg-white/60">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="eyebrow border-b border-ink/15 text-ink-mute">
            <tr>{["Pedido", "Data", "Cliente", "Total", "Status", ""].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {list.map((o) => (
              <Fragment key={o.id}>
                <tr className="border-b border-ink/10 align-middle">
                  <td className="px-4 py-3 font-semibold">{o.id}</td>
                  <td className="px-4 py-3 text-ink-soft">{dateBR(o.createdAt)}</td>
                  <td className="px-4 py-3">{o.customer.name}<span className="block text-xs text-ink-mute">{o.customer.city} / {o.customer.state}</span></td>
                  <td className="px-4 py-3 font-semibold tabular-nums">{brl(o.total)}</td>
                  <td className="px-4 py-3">
                    <label className="sr-only" htmlFor={`st-${o.id}`}>Status do pedido {o.id}</label>
                    <select id={`st-${o.id}`} value={o.status} onChange={(e) => { setStatus(o.id, e.target.value as OrderStatus); notify(`${o.id}: ${ORDER_STATUS[e.target.value as OrderStatus].label}`); }}
                      className={cn("cursor-pointer border-0 px-2 py-1.5 text-xs font-semibold", ORDER_STATUS[o.status].tone)}>
                      {ORDER_STATUS_IDS.map((s) => <option key={s} value={s}>{ORDER_STATUS[s].label}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" aria-expanded={open === o.id} onClick={() => setOpen(open === o.id ? null : o.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-wave hover:underline">
                      Detalhes <ChevronDown size={14} className={cn("transition-transform", open === o.id && "rotate-180")} />
                    </button>
                  </td>
                </tr>
                {open === o.id && (
                  <tr className="border-b border-ink/10 bg-paper-light/70">
                    <td colSpan={6} className="px-4 py-5">
                      <div className="grid gap-6 sm:grid-cols-3">
                        <div><p className="eyebrow mb-2 text-ink-mute">Cliente</p><p className="leading-relaxed">{o.customer.name}<br />{o.customer.email}<br />{o.customer.phone}</p></div>
                        <div><p className="eyebrow mb-2 text-ink-mute">Entrega</p><p className="leading-relaxed">{o.customer.street}, {o.customer.number} {o.customer.complement}<br />{o.customer.city} / {o.customer.state}<br />CEP {o.customer.cep}</p></div>
                        <div><p className="eyebrow mb-2 text-ink-mute">Itens · {PAYMENTS[o.payment]}</p>
                          {o.items.map((i, k) => <p key={k} className="leading-relaxed">{i.qty}× {i.title}<br /><span className="text-xs text-ink-mute">{i.sizeLabel} · moldura {FRAMES[i.frame].label.toLowerCase()} · {brl(i.unitPrice)}</span></p>)}
                          <p className="mt-2 text-xs text-ink-mute">Frete {brl(o.shipping)}{o.discount ? ` · desconto ${brl(o.discount)}` : ""}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {list.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-ink-mute">Nenhum pedido com este status.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
