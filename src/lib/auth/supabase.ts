// Real accounts, used when Supabase keys are set in .env.local.
// Table and security rules are in supabase/schema.sql.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { AuthError, emptyProfile, type AuthBackend, type Profile, type User } from "./types";

type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  home_city: string | null;
  language: string | null;
  currency: string | null;
  passport_country: string | null;
  travel_styles: string[] | null;
  visas: Profile["visas"] | null;
};

function toUser(user: { id: string; email?: string } | null | undefined): User | null {
  return user ? { id: user.id, email: user.email ?? "" } : null;
}

export function createSupabaseBackend(url: string, key: string): AuthBackend {
  const supabase: SupabaseClient = createClient(url, key);

  return {
    isDemo: false,

    async getUser() {
      const { data } = await supabase.auth.getSession();
      return toUser(data.session?.user);
    },

    onChange(callback) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        callback(toUser(session?.user));
      });
      return () => data.subscription.unsubscribe();
    },

    async signUp(name, email, password) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/profile`,
        },
      });
      if (error) {
        if (error.code === "user_already_exists") throw new AuthError("emailTaken");
        throw new AuthError("generic");
      }
      // With email confirmation on, Supabase hides duplicates by returning a user with no identities.
      if (data.user && data.user.identities?.length === 0) throw new AuthError("emailTaken");
      return { needsConfirmation: !data.session };
    },

    async signIn(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw new AuthError(error.code === "invalid_credentials" ? "wrongCredentials" : "generic");
      }
    },

    async signInWithGoogle() {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/profile` },
      });
      if (error) throw new AuthError("generic");
    },

    async signOut() {
      await supabase.auth.signOut();
    },

    async resetPassword(email) {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/profile`,
      });
    },

    async getProfile(user) {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<ProfileRow>();
      const base = emptyProfile();
      if (!data) return base;
      return {
        fullName: data.full_name ?? base.fullName,
        avatarUrl: data.avatar_url ?? base.avatarUrl,
        homeCity: data.home_city ?? base.homeCity,
        language: data.language === "en" ? "en" : "hy",
        currency: data.currency ?? base.currency,
        passportCountry: data.passport_country ?? base.passportCountry,
        travelStyles: data.travel_styles ?? [],
        visas: data.visas ?? [],
      };
    },

    async saveProfile(user, profile) {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: profile.fullName,
        avatar_url: profile.avatarUrl,
        home_city: profile.homeCity,
        language: profile.language,
        currency: profile.currency,
        passport_country: profile.passportCountry,
        travel_styles: profile.travelStyles,
        visas: profile.visas,
        updated_at: new Date().toISOString(),
      });
      if (error) throw new AuthError("generic");
    },

    async deleteAccount() {
      const { error } = await supabase.rpc("delete_my_account");
      if (error) throw new AuthError("generic");
      await supabase.auth.signOut();
    },
  };
}
