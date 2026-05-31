import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { isAdminUser } from "@/lib/admin";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { bootstrapAuth, getSession, onAuthChanged, signOut as authSignOut } from "./supabase/auth";
import type { AppSession, AppUser } from "./db/types";

type AuthCtx = {
  user: AppUser | null;
  session: AppSession | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AppSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setConfigError("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      setSession(null);
      setLoading(false);
      return;
    }
    setConfigError(null);
    const s = await getSession();
    setSession(s);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (isSupabaseConfigured()) await bootstrapAuth();
        if (cancelled) return;
        await refresh();
      } catch (e) {
        if (!cancelled) {
          console.error("Auth initialization failed:", e);
          const errorMsg = e instanceof Error 
            ? e.message 
            : (typeof e === "object" && e && "message" in e)
              ? String((e as { message: unknown }).message)
              : String(e);
          setConfigError(errorMsg || "Auth failed to start");
          setLoading(false);
        }
      }
    })();
    const unsub = onAuthChanged(() => {
      void refresh();
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [refresh]);

  if (configError && !loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="glass-strong max-w-md rounded-3xl p-8 text-center">
          <h1 className="text-lg font-semibold">Configuration required</h1>
          <p className="mt-2 text-sm text-muted-foreground">{configError}</p>
        </div>
      </div>
    );
  }

  return (
    <Ctx.Provider
      value={{
        user: session?.user ?? null,
        session,
        loading,
        isAdmin: isAdminUser(session?.user ?? null),
        signOut: async () => {
          await authSignOut();
          setSession(null);
        },
        refresh,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);

export type { AppUser, AppSession };
