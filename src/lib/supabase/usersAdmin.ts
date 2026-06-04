import type { UserRole } from "@/lib/userRoles";
import { getSupabase } from "./client";
import {
  createTeamMember as createMember,
  listStudentProfiles,
  listTeamMembersAll,
  removeTeamMember as removeMember,
} from "./data";

export type StudentCourseSummary = {
  code: string;
  name: string;
  attendance: number;
  marks: number;
  credits: number;
};

export type StudentAdminProfile = Awaited<ReturnType<typeof listStudentProfiles>>[number];

export type TeamMemberProfile = {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
};

export async function getStudentProfiles() {
  return listStudentProfiles();
}

export async function getTeamMembers() {
  return listTeamMembersAll();
}

export async function createTeamMember(input: {
  email: string;
  username: string;
  fullName: string;
  password: string;
  role: UserRole;
}) {
  return createMember(input);
}

export async function removeTeamMember(userId: string) {
  return removeMember(userId);
}

export async function removeStudentUser(userId: string): Promise<{ error?: string }> {
  const { error } = await getSupabase().from("profiles").delete().eq("id", userId);
  if (error) return { error: error.message };
  return {};
}
