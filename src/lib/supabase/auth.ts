import { getAdminCredentials } from "@/lib/admin";
import type { AppSession, AppUser } from "@/lib/db/types";
import { normalizeUsername, validateUsername } from "@/lib/username";
import type { UserRole } from "@/lib/userRoles";
import { getSupabase } from "./client";
import { fetchProfile, profileToAppUser } from "./data";

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

export async function bootstrapAuth(): Promise<void> {
  const sb = getSupabase();
  sb.auth.onAuthStateChange(() => {
    emitAuthChanged();
  });
}

async function sessionFromSupabase(): Promise<AppSession | null> {
  const sb = getSupabase();
  const { data: { session } } = await sb.auth.getSession();
  if (!session?.user) return null;
  const profile = await fetchProfile(session.user.id);
  if (!profile) return null;
  return {
    user: profileToAppUser(profile) as AppUser,
    access_token: session.access_token,
  };
}

export async function getSession(): Promise<AppSession | null> {
  return sessionFromSupabase();
}

export async function signIn(email: string, password: string): Promise<{ session?: AppSession; error?: string }> {
  const sb = getSupabase();
  const { error } = await sb.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) return { error: error.message };
  const session = await sessionFromSupabase();
  if (!session) return { error: "Profile not found. Contact support." };
  emitAuthChanged();
  return { session };
}

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  username: string,
): Promise<{ session?: AppSession; error?: string }> {
  const usernameErr = validateUsername(username);
  if (usernameErr) return { error: usernameErr };
  if (password.length < 6) return { error: "Password must be at least 6 characters" };

  const sb = getSupabase();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = normalizeUsername(username);
  const adminEmail = getAdminCredentials().email;

  const { data: existingUsername } = await sb
    .from("profiles")
    .select("id")
    .eq("username", normalizedUsername)
    .maybeSingle();
  if (existingUsername) return { error: "Username is already taken" };

  const role: UserRole =
    normalizedEmail === adminEmail.toLowerCase() ? "admin" : "student";

  const { data, error } = await sb.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: {
        username: normalizedUsername,
        full_name: fullName.trim() || "Student",
        role,
      },
    },
  });
  if (error) return { error: error.message };

  if (data.user && !data.session) {
    return {
      error: "Check your email to confirm your account, then sign in.",
    };
  }

  const session = await sessionFromSupabase();
  emitAuthChanged();
  return { session: session ?? undefined };
}

export async function signOut() {
  await getSupabase().auth.signOut();
  emitAuthChanged();
}

export async function changePassword(
  _userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ error?: string }> {
  if (newPassword.length < 6) return { error: "New password must be at least 6 characters" };
  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user?.email) return { error: "Not signed in" };

  const { error: signInErr } = await sb.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (signInErr) return { error: "Current password is incorrect" };

  const { error } = await sb.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };
  return {};
}
