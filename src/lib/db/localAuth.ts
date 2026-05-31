import { ensureAdminAccount } from "@/lib/admin";
import { hashPassword, verifyPassword } from "@/lib/password";
import { normalizeUsername, validateUsername, usernameFromEmail } from "@/lib/username";
import { db, isDbAvailable } from "./index";
import { ensureUserData } from "./migrate";
import type { AppSession, AppUser, DbUser } from "./types";

const SESSION_KEY = "current";
const AUTH_CHANGED = "ucc-auth-changed";

export function emitAuthChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGED));
  }
}

export function onAuthChanged(handler: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(AUTH_CHANGED, handler);
  return () => window.removeEventListener(AUTH_CHANGED, handler);
}

function toAppUser(user: DbUser): AppUser {
  return {
    id: user.id,
    email: user.email,
    user_metadata: {
      full_name: user.fullName || "Student",
      username: user.username ?? usernameFromEmail(user.email),
      role: user.role ?? "student",
    },
  };
}

export async function bootstrapAuth() {
  await ensureAdminAccount();
}

async function writeSession(user: AppUser) {
  const token = crypto.randomUUID();
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
  await db.sessions.put({
    id: SESSION_KEY,
    userId: user.id,
    token,
    expiresAt,
  });
  await ensureUserData(user.id);
  emitAuthChanged();
  return { user, access_token: token } satisfies AppSession;
}

export async function getSession(): Promise<AppSession | null> {
  if (!isDbAvailable()) return null;
  const row = await db.sessions.get(SESSION_KEY);
  if (!row || row.expiresAt < Date.now()) {
    if (row) await db.sessions.delete(SESSION_KEY);
    return null;
  }
  if (row.isGuest || row.userId === "guest") {
    await db.sessions.delete(SESSION_KEY);
    return null;
  }
  const user = await db.users.get(row.userId);
  if (!user) {
    await db.sessions.delete(SESSION_KEY);
    return null;
  }
  return { user: toAppUser(user), access_token: row.token };
}

export async function signIn(email: string, password: string): Promise<{ session?: AppSession; error?: string }> {
  if (!isDbAvailable()) return { error: "Database not available" };
  const normalized = email.trim().toLowerCase();
  const user = await db.users.where("email").equals(normalized).first();
  if (!user) return { error: "No account found for this email" };
  if (!(await verifyPassword(password, user))) return { error: "Incorrect password" };
  const session = await writeSession(toAppUser(user));
  return { session };
}

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  username: string,
): Promise<{ session?: AppSession; error?: string }> {
  if (!isDbAvailable()) return { error: "Database not available" };
  const usernameErr = validateUsername(username);
  if (usernameErr) return { error: usernameErr };
  const normalized = email.trim().toLowerCase();
  const normalizedUsername = normalizeUsername(username);
  const existing = await db.users.where("email").equals(normalized).first();
  if (existing) return { error: "An account with this email already exists" };
  if (await db.users.where("username").equals(normalizedUsername).first()) {
    return { error: "Username is already taken" };
  }
  const { hash, salt } = await hashPassword(password);
  const user: DbUser = {
    id: crypto.randomUUID(),
    email: normalized,
    username: normalizedUsername,
    passwordHash: hash,
    salt,
    fullName: fullName.trim() || "Student",
    role: "student",
    createdAt: new Date().toISOString(),
  };
  await db.users.add(user);
  const session = await writeSession(toAppUser(user));
  return { session };
}

export async function signOut() {
  await db.sessions.delete(SESSION_KEY);
  emitAuthChanged();
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ error?: string }> {
  if (!isDbAvailable()) return { error: "Database not available" };
  if (newPassword.length < 6) return { error: "New password must be at least 6 characters" };
  const user = await db.users.get(userId);
  if (!user) return { error: "Account not found" };
  if (!(await verifyPassword(currentPassword, user))) {
    return { error: "Current password is incorrect" };
  }
  const { hash, salt } = await hashPassword(newPassword);
  await db.users.update(userId, { passwordHash: hash, salt });
  return {};
}
