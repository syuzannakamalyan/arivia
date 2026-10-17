"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { localBackend } from "./local";
import { createSupabaseBackend } from "./supabase";
import { AuthError, type AuthBackend, type User } from "./types";
import { clearFailures, isLocked, recordFailure } from "./lockout";

export * from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Supabase when keys are set, otherwise the in-browser demo.
export const backend: AuthBackend =
  supabaseUrl && supabaseKey ? createSupabaseBackend(supabaseUrl, supabaseKey) : localBackend;

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    backend.getUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
    return backend.onChange(setUser);
  }, []);

  async function signIn(email: string, password: string) {
    if (isLocked(email)) throw new AuthError("locked");
    try {
      await backend.signIn(email, password);
      clearFailures(email);
    } catch (error) {
      if (error instanceof AuthError && error.code === "wrongCredentials") recordFailure(email);
      throw error;
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, isDemo: backend.isDemo, signIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
