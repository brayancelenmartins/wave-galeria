# THE WAVE — galeria e loja de quadros

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Lucide · Zustand.

## Como rodar

**Windows:** dê dois cliques em `iniciar.bat` (instala as dependências na primeira vez e abre http://localhost:3000).

Ou pelo terminal:

```bash
npm install
npm run dev      # desenvolvimento
npm run build && npm start   # produção
```

Requer Node.js 18.18 ou mais novo (https://nodejs.org).

## Páginas

| Rota | O que é |
|---|---|
| `/` | Home: hero com a arte THE WAVE, curadoria em evidência, Choose Your World, coleção atual |
| `/loja` | Grade com filtros (coleção, estilo, tamanho, preço, disponibilidade) e ordenação |
| `/colecao` | Choose Your World: Japão, Brasil e USA (abre a loja já filtrada) |
| `/galeria` | Exposição: uma obra por vez, na parede, com ficha técnica |
| `/obra/[slug]` | Detalhe: zoom, moldura, tamanho, preço em tempo real, obra no ambiente, certificado |
| `/checkout` | Endereço → Pagamento → Confirmação (simulado) |
| `/favoritos`, `/sobre` | Favoritos salvos e institucional |
| `/admin` | Métricas · `/admin/obras` CRUD de obras · `/admin/pedidos` pedidos e status |

Carrinho (gaveta lateral, com frete por CEP) e busca abrem pelos ícones do cabeçalho.

## Estrutura

```
src/
├── app/                 rotas (App Router)
│   ├── loja/ colecao/ galeria/ obra/[slug]/ checkout/ favoritos/ sobre/
│   └── admin/           layout próprio + métricas, obras, pedidos
├── components/
│   ├── layout/          Header, Footer, CartDrawer, SearchOverlay, WorldTransition, Toast
│   ├── art/             ArtCard, Frame (moldura), RoomMockup (ambiente), ZoomImage, ArtImage
│   ├── home/            Hero, Featured, WorldCards
│   ├── admin/           AdminGate (login), ArtworkForm, ImageDrop, Charts
│   └── ui/              Reveal, SectionTitle, PageHead
├── lib/
│   ├── types.ts         tipos (Artwork, Order, CartItem…)
│   ├── constants.ts     estilos, tamanhos, molduras, status, coleções
│   ├── pricing.ts       regra de preço (tamanho × moldura)
│   ├── shipping.ts      frete simulado por CEP
│   ├── supabase.ts      cliente do Supabase (nulo no modo demonstração)
│   ├── upload.ts        envio de imagens (HEIC, rotação, compressão, Storage)
│   └── data/            obras e pedidos de exemplo  ← edite aqui o catálogo inicial
└── store/               Zustand: catalog, cart, favorites, orders, ui
supabase/schema.sql      tabelas, regras de acesso e catálogo inicial do Supabase
render.yaml              configuração de deploy no Render
public/img/              hero, logo, obras locais, colagens dos mundos
```

## Dados

- **Sem configuração** (modo demonstração): catálogo, carrinho, favoritos e pedidos ficam no `localStorage` do navegador e `/admin` abre sem login.
- **Imagens das obras:** em Admin > Obras, escolha o arquivo, arraste ou cole (Ctrl+V). Aceita JPG, PNG, WEBP, GIF, AVIF
  e HEIC do iPhone; a imagem é girada conforme a câmera, reduzida e convertida para WEBP antes de subir.
  Com Supabase vai para o bucket `obras`; no modo demonstração fica no navegador.
- **Com Supabase** (`.env.local` preenchido): obras e pedidos ficam no banco, o checkout grava pela função `place_order`
  e `/admin` exige login de um e-mail autorizado. A estrutura está em `supabase/schema.sql`.

## Publicar

O passo a passo completo (Supabase + GitHub + Render + acesso ao admin) está em **[DEPLOY.md](DEPLOY.md)**.
