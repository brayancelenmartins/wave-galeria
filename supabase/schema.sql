-- THE WAVE: estrutura do banco no Supabase.
-- Cole este arquivo inteiro em SQL Editor > New query e clique em Run.
-- Pode ser executado mais de uma vez sem duplicar nada.

-- 1. Quem pode entrar no /admin ------------------------------------------------
create table if not exists public.admins (email text primary key);
alter table public.admins enable row level security; -- sem políticas: só o SQL Editor altera

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

-- 2. Obras ---------------------------------------------------------------------
create table if not exists public.artworks (
  id            text primary key,
  slug          text unique not null,
  title         text not null,
  artist        text not null,
  year          int  not null,
  style         text not null,
  world         text not null,
  technique     text not null default '',
  description   text not null default '',
  image         text not null default '',
  orientation   text not null,
  "basePrice"   int  not null,
  sizes         jsonb not null default '[]',
  frames        jsonb not null default '[]',
  status        text not null default 'disponivel' check (status in ('disponivel', 'encomenda', 'vendido')),
  stock         int  not null default 0,
  edition       text not null default '',
  views         int  not null default 0,
  featured      boolean not null default false,
  "createdAt"   timestamptz not null default now()
);
alter table public.artworks enable row level security;

drop policy if exists "obras: leitura publica" on public.artworks;
create policy "obras: leitura publica" on public.artworks for select using (true);
drop policy if exists "obras: admin altera" on public.artworks;
create policy "obras: admin altera" on public.artworks for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 3. Pedidos -------------------------------------------------------------------
create sequence if not exists public.orders_seq start 1100;

create table if not exists public.orders (
  id          text primary key,
  "createdAt" timestamptz not null default now(),
  status      text not null default 'pago' check (status in ('pago', 'producao', 'enviado', 'entregue')),
  customer    jsonb not null,
  payment     text not null,
  items       jsonb not null,
  subtotal    int not null,
  shipping    int not null,
  discount    int not null,
  total       int not null
);
alter table public.orders enable row level security;

drop policy if exists "pedidos: admin le" on public.orders;
create policy "pedidos: admin le" on public.orders for select to authenticated using (public.is_admin());
drop policy if exists "pedidos: admin atualiza" on public.orders;
create policy "pedidos: admin atualiza" on public.orders for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- O cliente não escreve direto na tabela: o checkout chama esta função,
-- que grava o pedido e dá baixa no estoque.
create or replace function public.place_order(p jsonb) returns text
language plpgsql security definer set search_path = public as $$
declare
  new_id text := 'WV-' || nextval('public.orders_seq');
  item jsonb;
begin
  if jsonb_typeof(p -> 'items') <> 'array' or jsonb_array_length(p -> 'items') = 0 then
    raise exception 'pedido sem itens';
  end if;

  insert into public.orders (id, customer, payment, items, subtotal, shipping, discount, total)
  values (new_id, p -> 'customer', p ->> 'payment', p -> 'items',
          (p ->> 'subtotal')::int, (p ->> 'shipping')::int, (p ->> 'discount')::int, (p ->> 'total')::int);

  for item in select * from jsonb_array_elements(p -> 'items') loop
    update public.artworks
       set stock  = greatest(0, stock - (item ->> 'qty')::int),
           status = case when stock - (item ->> 'qty')::int <= 0 then 'vendido' else status end
     where id = item ->> 'artworkId' and status = 'disponivel';
  end loop;

  return new_id;
end;
$$;

create or replace function public.increment_views(p_id text) returns void
language sql security definer set search_path = public as $$
  update public.artworks set views = views + 1 where id = p_id;
$$;

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.place_order(jsonb) to anon, authenticated;
grant execute on function public.increment_views(text) to anon, authenticated;

-- 4. Catálogo inicial (só entra se a obra ainda não existir) ------------------
insert into public.artworks
  (id, slug, title, artist, year, style, world, technique, description, image, orientation, "basePrice", sizes, frames, status, stock, edition, views, featured, "createdAt")
values
  ('obra-01', 'a-grande-onda-releitura', 'A Grande Onda, Releitura', 'Ateliê WAVE', 2026, 'Paisagem', 'japao', 'Impressão fine art em papel algodão 310 g', 'A onda que dá nome à casa. Uma releitura da gravura japonesa do século XIX, com o azul da Prússia recalibrado para pigmento mineral.', '/img/art/art-hokusai.jpg', 'paisagem', 2400, '[{"id":"P","w":40,"h":30},{"id":"M","w":70,"h":50},{"id":"G","w":110,"h":80},{"id":"X","w":140,"h":100}]'::jsonb, '["sem","preta","branca","madeira"]'::jsonb, 'disponivel', 6, 'Edição de 30', 1840, true, '2026-11-10T00:00:00.000Z'),
  ('obra-02', 'pagode-ao-amanhecer', 'Pagode ao Amanhecer', 'Ateliê WAVE', 2026, 'Paisagem', 'japao', 'Giclée sobre papel washi', 'O mar levanta e a cidade continua dormindo. Pagode, cerejeiras e o sol nascente em uma composição vertical feita para paredes estreitas.', '/img/art/art-pagoda.jpg', 'retrato', 2900, '[{"id":"P","w":30,"h":40},{"id":"M","w":50,"h":70},{"id":"G","w":80,"h":110},{"id":"X","w":100,"h":140}]'::jsonb, '["sem","preta","branca","madeira"]'::jsonb, 'disponivel', 4, 'Edição de 20', 1320, true, '2026-11-01T00:00:00.000Z'),
  ('obra-03', 'sol-vermelho-sobre-o-mar', 'Sol Vermelho sobre o Mar', 'Ateliê WAVE', 2025, 'Paisagem', 'japao', 'Giclée sobre papel washi', 'Um único disco vermelho segura toda a cena. Galhos de sakura entram pelo canto como quem chega atrasado.', '/img/art/art-sun.jpg', 'retrato', 2600, '[{"id":"P","w":30,"h":40},{"id":"M","w":50,"h":70},{"id":"G","w":80,"h":110},{"id":"X","w":100,"h":140}]'::jsonb, '["sem","preta","branca","madeira"]'::jsonb, 'disponivel', 5, 'Edição de 25', 990, false, '2026-10-23T00:00:00.000Z'),
  ('obra-04', 'tigre-entre-ameixeiras', 'Tigre entre Ameixeiras', 'Ateliê WAVE', 2025, 'Retrato', 'japao', 'Impressão fine art com acabamento manual', 'O predador em repouso. Linhas de xilogravura e laranja queimado sobre azul profundo, produzido sob encomenda em até 20 dias.', '/img/art/art-tiger.jpg', 'retrato', 3800, '[{"id":"P","w":30,"h":40},{"id":"M","w":50,"h":70},{"id":"G","w":80,"h":110},{"id":"X","w":100,"h":140}]'::jsonb, '["sem","preta","branca","madeira"]'::jsonb, 'encomenda', 0, 'Edição de 12', 1510, true, '2026-10-14T00:00:00.000Z'),
  ('obra-05', 'sakura-estudo-n-3', 'Sakura, Estudo nº 3', 'Ateliê WAVE', 2026, 'Minimalista', 'japao', 'Serigrafia em 4 cores', 'Um galho, nuvens e muito papel em branco. O estudo mais silencioso da série.', '/img/art/print-sakura.jpg', 'quadrado', 1450, '[{"id":"P","w":30,"h":30},{"id":"M","w":60,"h":60},{"id":"G","w":90,"h":90},{"id":"X","w":120,"h":120}]'::jsonb, '["sem","preta","branca","madeira"]'::jsonb, 'disponivel', 9, 'Edição de 50', 640, false, '2026-10-05T00:00:00.000Z'),
  ('obra-06', 'mare-alta', 'Maré Alta', 'Ateliê WAVE', 2026, 'Abstrato', 'japao', 'Serigrafia em 5 cores', 'A crista da onda cortada em formato quadrado, quase um padrão. Funciona sozinha ou em dupla com o Estudo nº 3.', '/img/art/print-sun.jpg', 'quadrado', 1650, '[{"id":"P","w":30,"h":30},{"id":"M","w":60,"h":60},{"id":"G","w":90,"h":90},{"id":"X","w":120,"h":120}]'::jsonb, '["sem","preta","branca","madeira"]'::jsonb, 'disponivel', 7, 'Edição de 40', 870, false, '2026-09-26T00:00:00.000Z'),
  ('obra-07', 'o-sono-do-tigre', 'O Sono do Tigre', 'Ateliê WAVE', 2025, 'Retrato', 'japao', 'Acrílica e nanquim sobre tela', 'Close do tigre adormecido. Peça única, vendida para uma coleção particular em São Paulo.', '/img/art/print-tiger.jpg', 'quadrado', 1900, '[{"id":"P","w":30,"h":30},{"id":"M","w":60,"h":60},{"id":"G","w":90,"h":90},{"id":"X","w":120,"h":120}]'::jsonb, '["sem","preta","branca","madeira"]'::jsonb, 'vendido', 0, 'Peça única', 1200, false, '2026-09-17T00:00:00.000Z'),
  ('obra-08', 'espuma', 'Espuma', 'Ateliê WAVE', 2024, 'Abstrato', 'japao', 'Serigrafia em 5 cores', 'Só a rebentação: garras de espuma contra o azul. O detalhe mais reconhecível da série, isolado.', '/img/art/print-wave.jpg', 'quadrado', 1750, '[{"id":"P","w":30,"h":30},{"id":"M","w":60,"h":60},{"id":"G","w":90,"h":90},{"id":"X","w":120,"h":120}]'::jsonb, '["sem","preta","branca","madeira"]'::jsonb, 'disponivel', 3, 'Edição de 40', 760, false, '2026-09-08T00:00:00.000Z'),
  ('obra-09', 'rio-seis-da-tarde', 'Rio, Seis da Tarde', 'Helena Paiva', 2025, 'Urbano', 'brasil', 'Fotografia, impressão em papel algodão', 'A hora em que a cidade acende e o morro ainda está dourado. Feita do alto, sem filtro e sem pressa.', 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1400&q=80', 'paisagem', 3200, '[{"id":"P","w":40,"h":30},{"id":"M","w":70,"h":50},{"id":"G","w":110,"h":80},{"id":"X","w":140,"h":100}]'::jsonb, '["sem","preta","branca","madeira"]'::jsonb, 'disponivel', 2, 'Edição de 15', 1105, false, '2026-08-30T00:00:00.000Z'),
  ('obra-10', 'tropicalia-em-azul', 'Tropicália em Azul', 'Caio Bragança', 2026, 'Abstrato', 'brasil', 'Acrílica sobre tela', 'Camadas de tinta derramada que lembram folha, rio e asfalto quente. Original assinado no verso.', 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=1400&q=80', 'retrato', 4600, '[{"id":"P","w":30,"h":40},{"id":"M","w":50,"h":70},{"id":"G","w":80,"h":110},{"id":"X","w":100,"h":140}]'::jsonb, '["sem","preta","branca","madeira"]'::jsonb, 'disponivel', 1, 'Obra original', 930, true, '2026-08-21T00:00:00.000Z'),
  ('obra-11', 'barro-e-ouro', 'Barro e Ouro', 'Caio Bragança', 2024, 'Abstrato', 'brasil', 'Técnica mista sobre tela', 'Terra do cerrado, folha de ouro e gesto largo. Cada encomenda é pintada de novo, nenhuma sai igual.', 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=1400&q=80', 'retrato', 5200, '[{"id":"P","w":30,"h":40},{"id":"M","w":50,"h":70},{"id":"G","w":80,"h":110},{"id":"X","w":100,"h":140}]'::jsonb, '["sem","preta","branca","madeira"]'::jsonb, 'encomenda', 0, 'Obra original', 580, false, '2026-08-12T00:00:00.000Z'),
  ('obra-12', 'serra-do-mar', 'Serra do Mar', 'Helena Paiva', 2023, 'Paisagem', 'brasil', 'Fotografia, impressão em papel algodão', 'Neblina subindo a serra logo cedo. Uma paisagem para olhar de longe e descansar a vista.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1400&q=80', 'paisagem', 2800, '[{"id":"P","w":40,"h":30},{"id":"M","w":70,"h":50},{"id":"G","w":110,"h":80},{"id":"X","w":140,"h":100}]'::jsonb, '["sem","preta","branca","madeira"]'::jsonb, 'disponivel', 4, 'Edição de 20', 710, false, '2026-08-03T00:00:00.000Z'),
  ('obra-13', 'chicago-grid', 'Chicago Grid', 'Noah Whitfield', 2025, 'Urbano', 'usa', 'Fotografia, impressão em metal escovado', 'A malha da cidade vista do lago. Aço, vidro e uma linha de horizonte que não termina.', 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1400&q=80', 'paisagem', 3400, '[{"id":"P","w":40,"h":30},{"id":"M","w":70,"h":50},{"id":"G","w":110,"h":80},{"id":"X","w":140,"h":100}]'::jsonb, '["sem","preta","branca","madeira"]'::jsonb, 'disponivel', 3, 'Edição de 15', 1010, true, '2026-07-25T00:00:00.000Z'),
  ('obra-14', 'manhattan-noturna', 'Manhattan Noturna', 'Noah Whitfield', 2024, 'Urbano', 'usa', 'Fotografia, impressão em papel barita', 'Edição esgotada. Janelas acesas como partitura, feita em uma única exposição longa.', 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1400&q=80', 'paisagem', 3600, '[{"id":"P","w":40,"h":30},{"id":"M","w":70,"h":50},{"id":"G","w":110,"h":80},{"id":"X","w":140,"h":100}]'::jsonb, '["sem","preta","branca","madeira"]'::jsonb, 'vendido', 0, 'Edição de 10', 1420, false, '2026-07-16T00:00:00.000Z'),
  ('obra-15', 'retrato-em-luz-baixa', 'Retrato em Luz Baixa', 'June Okafor', 2026, 'Retrato', 'usa', 'Fotografia, impressão em papel algodão', 'Um rosto, uma janela e nada mais. Da série feita em estúdios emprestados no Brooklyn.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1400&q=80', 'retrato', 4200, '[{"id":"P","w":30,"h":40},{"id":"M","w":50,"h":70},{"id":"G","w":80,"h":110},{"id":"X","w":100,"h":140}]'::jsonb, '["sem","preta","branca","madeira"]'::jsonb, 'disponivel', 2, 'Edição de 8', 860, false, '2026-07-07T00:00:00.000Z'),
  ('obra-16', 'color-field-n-7', 'Color Field nº 7', 'June Okafor', 2025, 'Minimalista', 'usa', 'Óleo sobre tela', 'Campos de cor que vibram na borda. Pede parede grande, luz natural e distância.', 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?auto=format&fit=crop&w=1400&q=80', 'paisagem', 5800, '[{"id":"P","w":40,"h":30},{"id":"M","w":70,"h":50},{"id":"G","w":110,"h":80},{"id":"X","w":140,"h":100}]'::jsonb, '["sem","preta","branca","madeira"]'::jsonb, 'disponivel', 1, 'Obra original', 690, true, '2026-06-28T00:00:00.000Z')
on conflict (id) do nothing;
