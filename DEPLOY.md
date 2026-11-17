# Como colocar o THE WAVE no ar (Supabase + Render)

Ordem: **1. Supabase** (banco e login) → **2. GitHub** (código) → **3. Render** (hospedagem) → **4. entrar no /admin**.
Tempo estimado: 30 a 40 minutos. Tudo cabe nos planos gratuitos.

---

## 1. Supabase: banco de dados e login do admin

1. Crie uma conta em https://supabase.com e clique em **New project**.
   Dê um nome (ex.: `wave`), crie uma senha de banco (guarde-a) e escolha a região **South America (São Paulo)**.
2. Abra **SQL Editor > New query**, cole **todo** o conteúdo de `supabase/schema.sql` e clique em **Run**.
   Isso cria as tabelas `artworks`, `orders` e `admins`, as regras de segurança e já insere as 16 obras do catálogo.
3. Crie o seu usuário: **Authentication > Users > Add user > Create new user**.
   Informe seu e-mail e uma senha forte e marque **Auto Confirm User**.
4. Autorize esse e-mail como administrador. De volta ao **SQL Editor**, rode (com o seu e-mail):

   ```sql
   insert into public.admins (email) values ('voce@seudominio.com');
   ```

5. Recomendado: em **Authentication > Sign In / Providers**, desligue **Allow new users to sign up**.
   (Mesmo ligado, só quem está na tabela `admins` consegue entrar no painel.)
6. Copie as duas chaves que o site precisa:
   - **Project URL**: em **Settings > API** (ou no botão **Connect** no topo). Formato `https://xxxxxxxx.supabase.co`.
   - **Chave pública**: em **Settings > API Keys**, a chave *publishable* (`sb_publishable_...`).
     Em projetos antigos ela aparece como `anon` `public`. As duas funcionam.

   Nunca use a chave *secret* / `service_role` no site.

### Testar no seu computador (opcional)

Crie o arquivo `.env.local` na pasta do projeto (copie de `.env.example`), preencha as duas variáveis e rode `iniciar.bat`.
A loja passa a ler as obras do Supabase e `/admin` passa a pedir login.

---

## 2. GitHub: subir o código

O Render publica a partir de um repositório Git.

**Jeito mais fácil (GitHub Desktop):**
1. Instale https://desktop.github.com e entre com sua conta do GitHub.
2. **File > Add local repository** e escolha a pasta `wave-galeria`. Quando ele avisar que não é um repositório, clique em **create a repository**.
3. **Publish repository** (pode deixar marcado como privado).

**Pelo terminal:**
```bash
cd wave-galeria
git init
git add .
git commit -m "THE WAVE"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/wave-galeria.git
git push -u origin main
```

O `.gitignore` já impede o envio de `node_modules`, `.next` e dos arquivos `.env`.

---

## 3. Render: publicar

1. Crie uma conta em https://render.com (entre com o GitHub).
2. **New > Web Service**, conecte o GitHub e escolha o repositório `wave-galeria`.
3. Preencha:

   | Campo | Valor |
   |---|---|
   | Language / Runtime | `Node` |
   | Branch | `main` |
   | Build Command | `npm install && npm run build` |
   | Start Command | `npm start` |
   | Instance Type | `Free` (ou `Starter` para não hibernar) |

4. Em **Environment Variables**, adicione:

   | Chave | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | a Project URL do passo 1.6 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | a chave pública do passo 1.6 |
   | `NODE_VERSION` | `22.12.0` |

5. Clique em **Deploy Web Service**. Em alguns minutos o site fica no ar em `https://wave-galeria.onrender.com` (o nome pode variar).

Alternativa: **New > Blueprint** usa o arquivo `render.yaml` do projeto e já preenche os comandos; você só informa as duas variáveis do Supabase.

**Importante:** as variáveis `NEXT_PUBLIC_...` entram no site durante o build. Se você alterar alguma depois, use **Manual Deploy > Deploy latest commit** para refazer o build.

**Atualizações:** cada `git push` na branch `main` publica de novo sozinho.

**Plano gratuito:** o serviço hiberna após 15 minutos sem visitas e a primeira visita seguinte demora perto de um minuto para carregar. Para uma loja em operação, use o plano Starter.

**Domínio próprio:** no serviço, **Settings > Custom Domains > Add Custom Domain**, e crie no seu provedor de domínio o registro DNS que o Render indicar. O HTTPS é automático.

---

## 4. Como entrar no /admin

- **No site publicado:** acesse `https://SEU-SITE/admin` (há também o link "Painel administrativo" no rodapé).
  Entre com o **e-mail e a senha criados no passo 1.3**. Só e-mails da tabela `admins` passam.
- **No seu computador, sem Supabase configurado:** `http://localhost:3000/admin` abre direto, sem login (modo demonstração: o que você altera fica só no seu navegador).

No painel: **Métricas** (faturamento, vendas, obras mais vistas), **Obras** (adicionar, editar, remover) e **Pedidos** (dados do cliente e status: Pago → Em produção → Enviado → Entregue). **Sair** fica no menu lateral.

**Outro administrador:** repita os passos 1.3 e 1.4 com o e-mail da pessoa.
**Remover acesso:** `delete from public.admins where email = '...';`
**Trocar a senha:** Supabase > Authentication > Users > (usuário) > Reset password.

---

## 5. Conferência depois de publicar

- [ ] A home abre e as obras aparecem em **Loja**.
- [ ] `/admin` pede login e aceita o seu e-mail.
- [ ] Editar o preço de uma obra no admin muda o preço na loja (teste em outra aba anônima).
- [ ] Um pedido de teste no checkout aparece em **Admin > Pedidos** e no Supabase em **Table Editor > orders**.

## 6. O que ainda falta para vender de verdade

- **Pagamento:** o checkout só registra o pedido; nada é cobrado. É preciso integrar um gateway (Mercado Pago, Pagar.me, Stripe) e,
  nesse momento, recalcular os preços no servidor, porque hoje o total vem do navegador do cliente.
- **Frete:** a tabela por CEP é simulada. Troque por uma cotação real (Correios, Melhor Envio).
- **E-mails:** o site ainda não envia confirmação de pedido.
- **Imagens:** as obras Brasil/USA apontam para fotos do Unsplash; troque pelas fotos das suas obras em Admin > Obras
  (suba os arquivos em Supabase > Storage, em um bucket público, e cole a URL). As colagens de `public/img/mundo/` mostram
  marcas e um atleta reais: confirme as licenças antes do uso comercial.
- **LGPD:** os pedidos guardam nome, e-mail, telefone e endereço. Publique uma política de privacidade.
