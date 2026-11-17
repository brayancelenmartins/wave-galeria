import type { Order, OrderStatus, PaymentMethod } from "../types";
import { SEED_ARTWORKS } from "./artworks";
import { priceFor } from "../pricing";

const PEOPLE: [string, string, string, string][] = [
  ["Marina Azevedo", "São Paulo", "SP", "01310-100"], ["Rafael Monteiro", "Rio de Janeiro", "RJ", "22071-000"],
  ["Beatriz Nogueira", "Curitiba", "PR", "80010-000"], ["Thiago Lacerda", "Belo Horizonte", "MG", "30130-000"],
  ["Luísa Ferraz", "Cuiabá", "MT", "78005-000"], ["André Sampaio", "Porto Alegre", "RS", "90010-000"],
  ["Camila Duarte", "Salvador", "BA", "40020-000"], ["Felipe Aranha", "Campinas", "SP", "13010-000"],
  ["Isabela Prado", "Recife", "PE", "50010-000"], ["Gustavo Leme", "Florianópolis", "SC", "88010-000"],
];
const PAY: PaymentMethod[] = ["pix", "cartao", "cartao", "boleto"];

// [mês (0-11 de 2026), dia, índice da obra, tamanho, moldura, status]
const ROWS: [number, number, number, "P" | "M" | "G", "sem" | "preta" | "branca" | "madeira", OrderStatus][] = [
  [5, 4, 0, "M", "preta", "entregue"], [5, 19, 4, "P", "sem", "entregue"],
  [6, 2, 1, "G", "madeira", "entregue"], [6, 15, 8, "M", "preta", "entregue"], [6, 27, 5, "M", "branca", "entregue"],
  [7, 6, 13, "G", "preta", "entregue"], [7, 21, 6, "M", "madeira", "entregue"],
  [8, 3, 9, "M", "sem", "entregue"], [8, 12, 0, "G", "madeira", "entregue"], [8, 25, 2, "M", "branca", "entregue"], [8, 29, 7, "P", "preta", "entregue"],
  [9, 5, 12, "M", "preta", "entregue"], [9, 14, 3, "G", "madeira", "entregue"], [9, 22, 15, "M", "sem", "enviado"], [9, 30, 1, "M", "preta", "entregue"],
  [10, 3, 0, "G", "preta", "enviado"], [10, 8, 14, "M", "branca", "producao"], [10, 11, 10, "M", "madeira", "producao"],
  [10, 14, 5, "P", "sem", "pago"], [10, 15, 2, "G", "preta", "pago"],
];

export const SEED_ORDERS: Order[] = ROWS.map(([month, day, ai, size, frame, status], i) => {
  const art = SEED_ARTWORKS[ai];
  const [name, city, state, cep] = PEOPLE[i % PEOPLE.length];
  const payment = PAY[i % PAY.length];
  const unitPrice = priceFor(art, size, frame);
  const shipping = unitPrice >= 5000 ? 0 : 129;
  const discount = payment === "pix" ? Math.round(unitPrice * 0.05) : 0;
  const s = art.sizes.find((x) => x.id === size)!;
  return {
    id: `WV-${1041 + i}`,
    createdAt: new Date(Date.UTC(2026, month, day, 15)).toISOString(),
    status,
    payment,
    customer: {
      name, email: `${name.split(" ")[0].toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")}@email.com`,
      phone: "(11) 9" + String(81234567 + i * 1371).slice(0, 4) + "-" + String(4410 + i * 13),
      cep, street: "Rua das Palmeiras", number: String(120 + i * 7), complement: "", city, state,
    },
    items: [{ artworkId: art.id, title: art.title, sizeLabel: `${s.w} × ${s.h} cm`, frame, qty: 1, unitPrice }],
    subtotal: unitPrice, shipping, discount, total: unitPrice + shipping - discount,
  };
}).reverse();
