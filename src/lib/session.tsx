import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getProductApi, type AccountUser } from "@/lib/product-api";
import { analytics } from "@/lib/analytics";

interface SessionValue {
  user: AccountUser | null;
  status: "loading" | "authenticated" | "anonymous";
  signIn: (email: string) => Promise<AccountUser>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

const STORAGE_KEY = "cor.demo.session";

export function SessionProvider({ children }: { children: ReactNode }) {
  const api = getProductApi();
  const [user, setUser] = useState<AccountUser | null>(null);
  const [status, setStatus] = useState<SessionValue["status"]>("loading");

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      let restored: AccountUser | null = null;
      if (api.mode === "demo") {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as { email?: string };
            if (parsed.email) restored = await api.signIn(parsed.email);
          } catch {
            window.localStorage.removeItem(STORAGE_KEY);
          }
        }
      } else {
        restored = await api.getCurrentUser();
      }
      if (cancelled) return;
      setUser(restored);
      setStatus(restored ? "authenticated" : "anonymous");
      if (restored) analytics.identify({ userId: restored.id, accountId: restored.company });
    }
    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [api]);

  const signIn = useCallback(
    async (email: string) => {
      const next = await api.signIn(email);
      setUser(next);
      setStatus("authenticated");
      analytics.identify({ userId: next.id, accountId: next.company });
      if (api.mode === "demo") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ email: next.email }));
      }
      return next;
    },
    [api],
  );

  const signOut = useCallback(async () => {
    await api.signOut();
    setUser(null);
    setStatus("anonymous");
    analytics.reset();
    if (api.mode === "demo") window.localStorage.removeItem(STORAGE_KEY);
  }, [api]);

  const value = useMemo<SessionValue>(
    () => ({ user, status, signIn, signOut }),
    [user, status, signIn, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
