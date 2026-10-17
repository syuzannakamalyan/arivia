// After 5 wrong passwords in a row, sign-in is paused for 1 minute (per email).
const KEY = "arivia-failed-signins";
const MAX_TRIES = 5;
const LOCK_MS = 60_000;

type Attempts = Record<string, { count: number; lockedUntil: number }>;

function read(): Attempts {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function write(attempts: Attempts) {
  try {
    localStorage.setItem(KEY, JSON.stringify(attempts));
  } catch {}
}

export function isLocked(email: string) {
  const entry = read()[email];
  return !!entry && entry.lockedUntil > Date.now();
}

export function recordFailure(email: string) {
  const attempts = read();
  const entry = attempts[email] ?? { count: 0, lockedUntil: 0 };
  entry.count += 1;
  if (entry.count >= MAX_TRIES) {
    entry.count = 0;
    entry.lockedUntil = Date.now() + LOCK_MS;
  }
  attempts[email] = entry;
  write(attempts);
}

export function clearFailures(email: string) {
  const attempts = read();
  delete attempts[email];
  write(attempts);
}
