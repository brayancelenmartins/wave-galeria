export type Style = "Abstrato" | "Minimalista" | "Paisagem" | "Retrato" | "Urbano";
export type World = "japao" | "brasil" | "usa";
export type SizeId = "P" | "M" | "G" | "X";
export type FrameId = "sem" | "preta" | "branca" | "madeira";
export type ArtworkStatus = "disponivel" | "encomenda" | "vendido";
export type Orientation = "retrato" | "paisagem" | "quadrado";

export interface SizeOption {
  id: SizeId;
  /** largura × altura em cm (para "X" é o tamanho mínimo sugerido) */
  w: number;
  h: number;
}

export interface Artwork {
  id: string;
  slug: string;
  title: string;
  artist: string;
  year: number;
  style: Style;
  world: World;
  technique: string;
  description: string;
  image: string;
  orientation: Orientation;
  /** preço em reais do tamanho Médio, sem moldura */
  basePrice: number;
  sizes: SizeOption[];
  frames: FrameId[];
  status: ArtworkStatus;
  stock: number;
  edition: string;
  views: number;
  featured: boolean;
  createdAt: string;
}

export interface CartItem {
  key: string;
  artworkId: string;
  slug: string;
  title: string;
  artist: string;
  image: string;
  sizeId: SizeId;
  sizeLabel: string;
  frame: FrameId;
  unitPrice: number;
  qty: number;
}

export type OrderStatus = "pago" | "producao" | "enviado" | "entregue";
export type PaymentMethod = "pix" | "cartao" | "boleto";

export interface Customer {
  name: string;
  email: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  city: string;
  state: string;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  customer: Customer;
  payment: PaymentMethod;
  items: Pick<CartItem, "artworkId" | "title" | "sizeLabel" | "frame" | "qty" | "unitPrice">[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}
