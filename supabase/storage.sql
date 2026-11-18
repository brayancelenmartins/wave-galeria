-- THE WAVE: armazenamento das imagens das obras (Supabase Storage).
-- Cole em SQL Editor > New query e clique em Run. Pode rodar mais de uma vez.
-- (Já incluído no final de schema.sql; rode este arquivo só se o schema.sql foi executado antes desta versão.)

-- bucket público: qualquer visitante vê as imagens; só o admin envia, troca ou apaga
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('obras', 'obras', true, 15728640, array['image/webp', 'image/jpeg', 'image/png', 'image/gif', 'image/avif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "obras: admin lista imagens" on storage.objects;
create policy "obras: admin lista imagens" on storage.objects for select to authenticated
  using (bucket_id = 'obras' and public.is_admin());

drop policy if exists "obras: admin envia imagens" on storage.objects;
create policy "obras: admin envia imagens" on storage.objects for insert to authenticated
  with check (bucket_id = 'obras' and public.is_admin());

drop policy if exists "obras: admin troca imagens" on storage.objects;
create policy "obras: admin troca imagens" on storage.objects for update to authenticated
  using (bucket_id = 'obras' and public.is_admin())
  with check (bucket_id = 'obras' and public.is_admin());

drop policy if exists "obras: admin apaga imagens" on storage.objects;
create policy "obras: admin apaga imagens" on storage.objects for delete to authenticated
  using (bucket_id = 'obras' and public.is_admin());
