"use client";
import { useEffect, useState, type ReactNode } from "react";
import { LogIn } from "lucide-react";
import Logo from "@/components/layout/Logo";
import { supabase } from "@/lib/supabase";
import { useCatalog } from "@/store/catalog";
import { useOrders } from "@/store/orders";

type State = "loading" | "out" | "denied" | "in";

/**
 * Protege o /admin. Com Supabase: exige login (Supabase Auth) e e-mail na tabela `admins`.
 * Sem Supabase (modo demonstração): acesso livre, os dados ficam só neste navegador.
 */
export default function AdminGate({ children }: { children: (logout: (() => void) | null) => ReactNode }) {
  const [state, setState] = useState<State>(supabase ? "loading" : "in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    const db = supabase;
    const check = async (logged: boolean) => {
      if (!logged) return setState("out");
      const { data } = await db.rpc("is_admin");
      if (data === true) {
        setState("in");
        useCatalog.getState().load();
        useOrders.getState().load();
      } else setState("denied");
    };
    db.auth.getSession().then(({ data }) => check(!!data.session));
    const { data: sub } = db.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") setTimeout(() => check(!!session), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const logout = supabase ? () => { supabase!.auth.signOut(); } : null;

  if (state === "in") return <>{children(logout)}</>;

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError("");
    const { error } = await supabase!.auth.signInWithPassword({ email: email.trim(), password });
    if (error) setError("E-mail ou senha incorretos.");
    setBusy(false);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-navy-deep p-5">
      <div className="w-full max-w-sm bg-paper p-7 shadow-2xl sm:p-9">
        <Logo />
        <h1 className="display mt-6 text-4xl text-navy">Admin</h1>
        {state === "loading" && <p className="mt-4 text-sm text-ink-soft">Verificando acesso…</p>}
        {state === "denied" && (
          <div className="mt-4">
            <p className="text-sm text-ink-soft">Esta conta não tem permissão de administrador.</p>
            <button type="button" onClick={() => logout?.()} className="btn-outline mt-5 w-full">Sair</button>
          </div>
        )}
        {state === "out" && (
          <form onSubmit={login} className="mt-5 space-y-4">
            <label className="block"><span className="label">E-mail</span>
              <input type="email" required autoComplete="username" className="field" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
            <label className="block"><span className="label">Senha</span>
              <input type="password" required autoComplete="current-password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
            {error && <p role="alert" className="text-sm font-medium text-sun">{error}</p>}
            <button type="submit" disabled={busy} className="btn-solid w-full"><LogIn size={16} /> {busy ? "Entrando…" : "Entrar"}</button>
          </form>
        )}
      </div>
    </div>
  );
}
