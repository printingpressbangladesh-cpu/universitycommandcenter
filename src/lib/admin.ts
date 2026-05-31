import { isAdminRole } from "@/lib/userRoles";

const ADMIN_EMAIL =
  (import.meta.env.VITE_ADMIN_EMAIL as string | undefined)?.trim().toLowerCase() ||
  "universitycommandcenter@gmail.com";
const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) || "admin123";
const ADMIN_NAME = (import.meta.env.VITE_ADMIN_NAME as string | undefined) || "Administrator";
const ADMIN_USERNAME =
  (import.meta.env.VITE_ADMIN_USERNAME as string | undefined)?.trim().toLowerCase() || "ucc_admin";

export function getAdminCredentials() {
  return { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, name: ADMIN_NAME, username: ADMIN_USERNAME };
}

export function isAdminUser(user: { id: string; user_metadata?: { role?: string } } | null) {
  if (!user || user.id === "guest") return false;
  return isAdminRole(user.user_metadata?.role);
}
