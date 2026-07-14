"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

interface AuthContextValue {
  user: User | null;
  /** True once we've resolved (or provisioned) a session. */
  ready: boolean;
  /** False when Supabase keys aren't configured (design-preview mode). */
  configured: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  ready: false,
  configured: false,
});

/**
 * Guarantees a Supabase session. If the visitor has no session yet we create
 * an anonymous one — a real auth.users row, so RLS and the profile trigger
 * work exactly as they would for a signed-up user. The session lives in
 * cookies, so server Route Handlers see the same user.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = hasSupabaseEnv();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!configured);

  useEffect(() => {
    if (!configured) return;
    const supabase = createClient();
    let active = true;

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      let current = session?.user ?? null;
      if (!current) {
        const { data } = await supabase.auth.signInAnonymously();
        current = data.user ?? null;
      }
      if (!active) return;
      setUser(current);
      setReady(true);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [configured]);

  return (
    <AuthContext.Provider value={{ user, ready, configured }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
