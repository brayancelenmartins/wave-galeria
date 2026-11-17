import type { Artwork, FrameId, Orientation, SizeOption, Style, World, ArtworkStatus } from "../types";
import { slugify } from "../format";

const ALL_FRAMES: FrameId[] = ["sem", "preta", "branca", "madeira"];
const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1400&q=80`;

const DIMS: Record<Orientation, SizeOption[]> = {
  retrato: [{ id: "P", w: 30, h: 40 }, { id: "M", w: 50, h: 70 }, { id: "G", w: 80, h: 110 }, { id: "X", w: 100, h: 140 }],
  paisagem: [{ id: "P", w: 40, h: 30 }, { id: "M", w: 70, h: 50 }, { id: "G", w: 110, h: 80 }, { id: "X", w: 140, h: 100 }],
  quadrado: [{ id: "P", w: 30, h: 30 }, { id: "M", w: 60, h: 60 }, { id: "G", w: 90, h: 90 }, { id: "X", w: 120, h: 120 }],
};

type Seed = [title: string, artist: string, year: number, style: Style, world: World, image: string, orientation: Orientation,
  basePrice: number, status: ArtworkStatus, stock: number, edition: string, views: number, technique: string, description: string];

const SEEDS: Seed[] = [
  ["A Grande Onda, Releitura", "Ateliê WAVE", 2026, "Paisagem", "japao", "/img/art/art-hokusai.jpg", "paisagem", 2400, "disponivel", 6, "Edição de 30", 1840,
    "Impressão fine art em papel algodão 310 g", "A onda que dá nome à casa. Uma releitura da gravura japonesa do século XIX, com o azul da Prússia recalibrado para pigmento mineral."],
  ["Pagode ao Amanhecer", "Ateliê WAVE", 2026, "Paisagem", "japao", "/img/art/art-pagoda.jpg", "retrato", 2900, "disponivel", 4, "Edição de 20", 1320,
    "Giclée sobre papel washi", "O mar levanta e a cidade continua dormindo. Pagode, cerejeiras e o sol nascente em uma composição vertical feita para paredes estreitas."],
  ["Sol Vermelho sobre o Mar", "Ateliê WAVE", 2025, "Paisagem", "japao", "/img/art/art-sun.jpg", "retrato", 2600, "disponivel", 5, "Edição de 25", 990,
    "Giclée sobre papel washi", "Um único disco vermelho segura toda a cena. Galhos de sakura entram pelo canto como quem chega atrasado."],
  ["Tigre entre Ameixeiras", "Ateliê WAVE", 2025, "Retrato", "japao", "/img/art/art-tiger.jpg", "retrato", 3800, "encomenda", 0, "Edição de 12", 1510,
    "Impressão fine art com acabamento manual", "O predador em repouso. Linhas de xilogravura e laranja queimado sobre azul profundo, produzido sob encomenda em até 20 dias."],
  ["Sakura, Estudo nº 3", "Ateliê WAVE", 2026, "Minimalista", "japao", "/img/art/print-sakura.jpg", "quadrado", 1450, "disponivel", 9, "Edição de 50", 640,
    "Serigrafia em 4 cores", "Um galho, nuvens e muito papel em branco. O estudo mais silencioso da série."],
  ["Maré Alta", "Ateliê WAVE", 2026, "Abstrato", "japao", "/img/art/print-sun.jpg", "quadrado", 1650, "disponivel", 7, "Edição de 40", 870,
    "Serigrafia em 5 cores", "A crista da onda cortada em formato quadrado, quase um padrão. Funciona sozinha ou em dupla com o Estudo nº 3."],
  ["O Sono do Tigre", "Ateliê WAVE", 2025, "Retrato", "japao", "/img/art/print-tiger.jpg", "quadrado", 1900, "vendido", 0, "Peça única", 1200,
    "Acrílica e nanquim sobre tela", "Close do tigre adormecido. Peça única, vendida para uma coleção particular em São Paulo."],
  ["Espuma", "Ateliê WAVE", 2024, "Abstrato", "japao", "/img/art/print-wave.jpg", "quadrado", 1750, "disponivel", 3, "Edição de 40", 760,
    "Serigrafia em 5 cores", "Só a rebentação: garras de espuma contra o azul. O detalhe mais reconhecível da série, isolado."],
  ["Rio, Seis da Tarde", "Helena Paiva", 2025, "Urbano", "brasil", unsplash("1483729558449-99ef09a8c325"), "paisagem", 3200, "disponivel", 2, "Edição de 15", 1105,
    "Fotografia, impressão em papel algodão", "A hora em que a cidade acende e o morro ainda está dourado. Feita do alto, sem filtro e sem pressa."],
  ["Tropicália em Azul", "Caio Bragança", 2026, "Abstrato", "brasil", unsplash("1541961017774-22349e4a1262"), "retrato", 4600, "disponivel", 1, "Obra original", 930,
    "Acrílica sobre tela", "Camadas de tinta derramada que lembram folha, rio e asfalto quente. Original assinado no verso."],
  ["Barro e Ouro", "Caio Bragança", 2024, "Abstrato", "brasil", unsplash("1549490349-8643362247b5"), "retrato", 5200, "encomenda", 0, "Obra original", 580,
    "Técnica mista sobre tela", "Terra do cerrado, folha de ouro e gesto largo. Cada encomenda é pintada de novo, nenhuma sai igual."],
  ["Serra do Mar", "Helena Paiva", 2023, "Paisagem", "brasil", unsplash("1506905925346-21bda4d32df4"), "paisagem", 2800, "disponivel", 4, "Edição de 20", 710,
    "Fotografia, impressão em papel algodão", "Neblina subindo a serra logo cedo. Uma paisagem para olhar de longe e descansar a vista."],
  ["Chicago Grid", "Noah Whitfield", 2025, "Urbano", "usa", unsplash("1477959858617-67f85cf4f1df"), "paisagem", 3400, "disponivel", 3, "Edição de 15", 1010,
    "Fotografia, impressão em metal escovado", "A malha da cidade vista do lago. Aço, vidro e uma linha de horizonte que não termina."],
  ["Manhattan Noturna", "Noah Whitfield", 2024, "Urbano", "usa", unsplash("1480714378408-67cf0d13bc1b"), "paisagem", 3600, "vendido", 0, "Edição de 10", 1420,
    "Fotografia, impressão em papel barita", "Edição esgotada. Janelas acesas como partitura, feita em uma única exposição longa."],
  ["Retrato em Luz Baixa", "June Okafor", 2026, "Retrato", "usa", unsplash("1544005313-94ddf0286df2"), "retrato", 4200, "disponivel", 2, "Edição de 8", 860,
    "Fotografia, impressão em papel algodão", "Um rosto, uma janela e nada mais. Da série feita em estúdios emprestados no Brooklyn."],
  ["Color Field nº 7", "June Okafor", 2025, "Minimalista", "usa", unsplash("1536924940846-227afb31e2a5"), "paisagem", 5800, "disponivel", 1, "Obra original", 690,
    "Óleo sobre tela", "Campos de cor que vibram na borda. Pede parede grande, luz natural e distância."],
];

export const SEED_ARTWORKS: Artwork[] = SEEDS.map(
  ([title, artist, year, style, world, image, orientation, basePrice, status, stock, edition, views, technique, description], i) => ({
    id: `obra-${String(i + 1).padStart(2, "0")}`,
    slug: slugify(title),
    title, artist, year, style, world, image, orientation, basePrice, status, stock, edition, views, technique, description,
    sizes: DIMS[orientation],
    frames: ALL_FRAMES,
    featured: [0, 1, 3, 9, 12, 15].includes(i),
    // datas decrescentes: a primeira obra é a mais recente
    createdAt: new Date(Date.UTC(2026, 10, 10 - i * 9)).toISOString(),
  }),
);

export const DEFAULT_DIMS = DIMS;
