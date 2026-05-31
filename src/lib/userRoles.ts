export type UserRole =
  | "admin"
  | "student"
  | "student_support"
  | "technical"
  | "operations"
  | "academic";

export const TEAM_ROLES: UserRole[] = [
  "student_support",
  "technical",
  "operations",
  "academic",
];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  student: "Student",
  student_support: "Student support",
  technical: "Technical team",
  operations: "Operations",
  academic: "Academic team",
};

export function getRoleLabel(role?: string): string {
  if (!role || !(role in ROLE_LABELS)) return "Student";
  return ROLE_LABELS[role as UserRole];
}

export function isAdminRole(role?: string): boolean {
  return role === "admin";
}

export function isStudentRole(role?: string): boolean {
  return !role || role === "student";
}

export function isTeamRole(role?: string): boolean {
  return !!role && TEAM_ROLES.includes(role as UserRole);
}
