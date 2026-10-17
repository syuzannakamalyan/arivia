export type Visa = {
  id: string;
  country: string;
  type: string;
  expiry: string; // YYYY-MM-DD
};

export type Profile = {
  fullName: string;
  avatarUrl: string;
  homeCity: string;
  language: "hy" | "en";
  currency: string;
  passportCountry: string;
  travelStyles: string[];
  visas: Visa[];
};

export type User = {
  id: string;
  email: string;
};

export type AuthErrorCode = "emailTaken" | "wrongCredentials" | "locked" | "generic";

export class AuthError extends Error {
  constructor(public code: AuthErrorCode) {
    super(code);
  }
}

// Every way of storing accounts (the local demo or Supabase) offers the same actions,
// so the pages don't need to know which one is in use.
export interface AuthBackend {
  isDemo: boolean;
  getUser(): Promise<User | null>;
  onChange(callback: (user: User | null) => void): () => void;
  signUp(name: string, email: string, password: string): Promise<{ needsConfirmation: boolean }>;
  signIn(email: string, password: string): Promise<void>;
  signInWithGoogle(): Promise<void>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  getProfile(user: User): Promise<Profile>;
  saveProfile(user: User, profile: Profile): Promise<void>;
  deleteAccount(user: User): Promise<void>;
}

export function emptyProfile(fullName = ""): Profile {
  return {
    fullName,
    avatarUrl: "",
    homeCity: "Երևան",
    language: "hy",
    currency: "AMD",
    passportCountry: "AM",
    travelStyles: [],
    visas: [],
  };
}
