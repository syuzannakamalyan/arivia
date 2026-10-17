// Demo stand-in used until Supabase keys are added.
// Accounts and profiles live in this browser's localStorage, so every screen
// can be tried without any server. Not for real users.
import { AuthError, emptyProfile, type AuthBackend, type Profile, type User } from "./types";

type StoredUser = User & { name: string; salt: string; passwordHash: string };

const USERS_KEY = "arivia-demo-users";
const PROFILES_KEY = "arivia-demo-profiles";
const SESSION_KEY = "arivia-demo-session";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

async function hash(password: string, salt: string) {
  const bytes = new TextEncoder().encode(salt + password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

const listeners = new Set<(user: User | null) => void>();

function currentUser(): User | null {
  const id = load<string | null>(SESSION_KEY, null);
  if (!id) return null;
  const found = Object.values(load<Record<string, StoredUser>>(USERS_KEY, {})).find((u) => u.id === id);
  return found ? { id: found.id, email: found.email } : null;
}

function setSession(user: User | null) {
  if (user) save(SESSION_KEY, user.id);
  else localStorage.removeItem(SESSION_KEY);
  listeners.forEach((listener) => listener(user));
}

async function createUser(name: string, email: string, password: string) {
  const users = load<Record<string, StoredUser>>(USERS_KEY, {});
  if (users[email]) throw new AuthError("emailTaken");
  const salt = crypto.randomUUID();
  const user: StoredUser = {
    id: crypto.randomUUID(),
    email,
    name,
    salt,
    passwordHash: await hash(password, salt),
  };
  users[email] = user;
  save(USERS_KEY, users);
  const profiles = load<Record<string, Profile>>(PROFILES_KEY, {});
  profiles[user.id] = emptyProfile(name);
  save(PROFILES_KEY, profiles);
  return user;
}

export const localBackend: AuthBackend = {
  isDemo: true,

  async getUser() {
    return currentUser();
  },

  onChange(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },

  async signUp(name, email, password) {
    const user = await createUser(name, email, password);
    setSession({ id: user.id, email: user.email });
    return { needsConfirmation: false };
  },

  async signIn(email, password) {
    const user = load<Record<string, StoredUser>>(USERS_KEY, {})[email];
    if (!user || (await hash(password, user.salt)) !== user.passwordHash) {
      throw new AuthError("wrongCredentials");
    }
    setSession({ id: user.id, email: user.email });
  },

  async signInWithGoogle() {
    // Pretend Google account, so the button can be shown in the demo.
    const email = "demo.google@arivia.am";
    const users = load<Record<string, StoredUser>>(USERS_KEY, {});
    const user = users[email] ?? (await createUser("Google Demo", email, crypto.randomUUID()));
    setSession({ id: user.id, email: user.email });
  },

  async signOut() {
    setSession(null);
  },

  async resetPassword() {
    // Nothing to send in the demo; the page shows the same message as the real one.
  },

  async getProfile(user) {
    return load<Record<string, Profile>>(PROFILES_KEY, {})[user.id] ?? emptyProfile();
  },

  async saveProfile(user, profile) {
    const profiles = load<Record<string, Profile>>(PROFILES_KEY, {});
    profiles[user.id] = profile;
    save(PROFILES_KEY, profiles);
  },

  async deleteAccount(user) {
    const users = load<Record<string, StoredUser>>(USERS_KEY, {});
    delete users[user.email];
    save(USERS_KEY, users);
    const profiles = load<Record<string, Profile>>(PROFILES_KEY, {});
    delete profiles[user.id];
    save(PROFILES_KEY, profiles);
    setSession(null);
  },
};
