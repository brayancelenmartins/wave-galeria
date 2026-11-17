import type { ArtworkStatus, FrameId, OrderStatus, PaymentMethod, SizeId, Style, World } from "./types";

export const STYLES: Style[] = ["Abstrato", "Minimalista", "Paisagem", "Retrato", "Urbano"];

export const SIZES: Record<SizeId, { label: string; multiplier: number }> = {
  P: { label: "Pequeno", multiplier: 0.65 },
  M: { label: "Médio", multiplier: 1 },
  G: { label: "Grande", multiplier: 1.7 },
  X: { label: "Personalizado", multiplier: 2.4 },
};
export const SIZE_IDS = Object.keys(SIZES) as SizeId[];

export const FRAMES: Record<FrameId, { label: string; price: number; color: string }> = {
  sem: { label: "Sem moldura", price: 0, color: "transparent" },
  preta: { label: "Preta", price: 290, color: "#15171b" },
  branca: { label: "Branca", price: 290, color: "#f6f4ee" },
  madeira: { label: "Madeira", price: 420, color: "#a9773f" },
};
export const FRAME_IDS = Object.keys(FRAMES) as FrameId[];

export const STATUS: Record<ArtworkStatus, { label: string; tone: string }> = {
  disponivel: { label: "Disponível", tone: "bg-emerald-700" },
  encomenda: { label: "Sob encomenda", tone: "bg-wave" },
  vendido: { label: "Vendido", tone: "bg-sun" },
};
export const STATUS_IDS = Object.keys(STATUS) as ArtworkStatus[];

export const WORLDS: Record<World, { label: string; tagline: string; image: string }> = {
  japao: { label: "Japão", tagline: "A série da onda: ukiyo-e relido em azul da Prússia.", image: "/img/art/print-wave.jpg" },
  brasil: { label: "Brasil", tagline: "Trópico, barro, calor e cidade à beira-mar.", image: "/img/mundo/brasil.jpg" },
  usa: { label: "USA", tagline: "Skyline, estrada e campos de cor.", image: "/img/mundo/usa.jpg" },
};
export const WORLD_IDS = Object.keys(WORLDS) as World[];

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: string }> = {
  pago: { label: "Pago", tone: "bg-amber-100 text-amber-900" },
  producao: { label: "Em produção / emolduramento", tone: "bg-wave-pale text-navy" },
  enviado: { label: "Enviado", tone: "bg-violet-100 text-violet-900" },
  entregue: { label: "Entregue", tone: "bg-emerald-100 text-emerald-900" },
};
export const ORDER_STATUS_IDS = Object.keys(ORDER_STATUS) as OrderStatus[];

export const PAYMENTS: Record<PaymentMethod, string> = { pix: "Pix", cartao: "Cartão de crédito", boleto: "Boleto" };

export const PIX_DISCOUNT = 0.05;
export const FREE_SHIPPING_FROM = 5000;
