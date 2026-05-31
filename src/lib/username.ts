const USERNAME_RE = /^[a-zA-Z0-9_]{3,24}$/;

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateUsername(raw: string): string | undefined {
  const u = normalizeUsername(raw);
  if (!u) return "Username is required";
  if (!USERNAME_RE.test(u)) {
    return "Use 3–24 characters: letters, numbers, and underscores only";
  }
  return undefined;
}

export function usernameFromEmail(email: string): string {
  const base = email
    .split("@")[0]
    .replace(/[^a-z0-9]/gi, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase()
    .slice(0, 16);
  return base.length >= 3 ? base : `user_${base || "ucc"}`;
}
