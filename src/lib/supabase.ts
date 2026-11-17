import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
// aceita a chave nova (sb_publishable_…) ou a antiga "anon"
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Cliente do Supabase. Fica `null` quando as variáveis não estão definidas:
 * nesse caso o site roda em modo demonstração, com os dados no navegador.
 */
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null;
export const isRemote = supabase !== null;
