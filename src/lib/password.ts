import type { DbUser } from "@/lib/db/types";

export async function hashPassword(password: string, saltB64?: string) {
  const enc = new TextEncoder();
  const salt = saltB64
    ? Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0))
    : crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 120_000, hash: "SHA-256" },
    keyMaterial,
    256,
  );
  const hash = btoa(String.fromCharCode(...new Uint8Array(bits)));
  const saltOut = btoa(String.fromCharCode(...salt));
  return { hash, salt: saltOut };
}

export async function verifyPassword(password: string, user: DbUser) {
  const { hash } = await hashPassword(password, user.salt);
  return hash === user.passwordHash;
}
