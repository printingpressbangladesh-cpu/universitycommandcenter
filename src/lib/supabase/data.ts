import type {
  Assignment,
  AttendanceLog,
  Course,
  ExamChecklistItem,
  ExamEntry,
  Holiday,
  Note,
  NotificationPrefs,
  RoutineBlock,
  SemesterPeriod,
  StudySession,
} from "@/lib/types";
import type { UserRole } from "@/lib/userRoles";
import { getDefaultAdminFormUrl } from "@/lib/notificationsApi";
import { defaultSemester, weekStartKey } from "@/lib/scheduleUtils";
import { isStudentRole, TEAM_ROLES } from "@/lib/userRoles";
import { normalizeUsername, usernameFromEmail } from "@/lib/username";
import { getSupabase } from "./client";
import {
  assignmentToRow,
  attendanceToRow,
  courseToRow,
  examToRow,
  holidayToRow,
  noteToRow,
  notificationPrefsToRow,
  profileToAppUser,
  rowToAssignment,
  rowToAttendance,
  rowToChecklist,
  rowToCourse,
  rowToExam,
  rowToHoliday,
  rowToNote,
  rowToNotificationPrefs,
  rowToRoutine,
  rowToSemester,
  rowToStudySession,
  routineToRow,
  semesterToRow,
  studySessionToRow,
  type ProfileRow,
} from "./mappers";

export { profileToAppUser };

export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await getSupabase().from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data as ProfileRow | null;
}

// --- Courses ---
export async function listCourses(userId: string): Promise<Course[]> {
  const { data, error } = await getSupabase().from("courses").select("*").eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r) => rowToCourse(r as Record<string, unknown>));
}

export async function upsertCourse(userId: string, course: Course) {
  const { error } = await getSupabase().from("courses").upsert(courseToRow(userId, course));
  if (error) throw error;
}

export async function deleteCourse(courseId: string) {
  const { error } = await getSupabase().from("courses").delete().eq("id", courseId);
  if (error) throw error;
}

export async function getCourse(courseId: string): Promise<(Course & { userId: string }) | null> {
  const { data, error } = await getSupabase().from("courses").select("*").eq("id", courseId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as Record<string, unknown>;
  return { ...rowToCourse(row), userId: row.user_id as string };
}

// --- Exam dates ---
export async function listExamDates(userId: string): Promise<Record<string, string>> {
  const { data, error } = await getSupabase().from("exam_dates").select("*").eq("user_id", userId);
  if (error) throw error;
  return Object.fromEntries((data ?? []).map((r) => [r.course_id as string, r.iso_date as string]));
}

export async function setExamDate(userId: string, courseId: string, isoDate: string) {
  const { error } = await getSupabase()
    .from("exam_dates")
    .upsert({ user_id: userId, course_id: courseId, iso_date: isoDate });
  if (error) throw error;
}

// --- Assignments ---
export async function listAssignments(userId: string): Promise<Assignment[]> {
  const { data, error } = await getSupabase().from("assignments").select("*").eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r) => rowToAssignment(r as Record<string, unknown>));
}

export async function replaceAssignments(userId: string, list: Assignment[]) {
  const sb = getSupabase();
  await sb.from("assignments").delete().eq("user_id", userId);
  if (list.length === 0) return;
  const { error } = await sb.from("assignments").insert(list.map((a) => assignmentToRow(userId, a)));
  if (error) throw error;
}

// --- Notes ---
export async function listNotes(userId: string): Promise<Note[]> {
  const { data, error } = await getSupabase().from("notes").select("*").eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r) => rowToNote(r as Record<string, unknown>));
}

export async function replaceNotes(userId: string, list: Note[]) {
  const sb = getSupabase();
  await sb.from("notes").delete().eq("user_id", userId);
  if (list.length === 0) return;
  const { error } = await sb.from("notes").insert(list.map((n) => noteToRow(userId, n)));
  if (error) throw error;
}

// --- Routines ---
export async function listRoutines(userId: string): Promise<RoutineBlock[]> {
  const { data, error } = await getSupabase().from("routines").select("*").eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r) => rowToRoutine(r as Record<string, unknown>));
}

export async function upsertRoutine(userId: string, block: RoutineBlock) {
  const { error } = await getSupabase().from("routines").upsert(routineToRow(userId, block));
  if (error) throw error;
}

export async function deleteRoutine(id: string) {
  const { error } = await getSupabase().from("routines").delete().eq("id", id);
  if (error) throw error;
}

// --- Exams ---
export async function listExams(userId: string): Promise<ExamEntry[]> {
  const { data, error } = await getSupabase().from("exams").select("*").eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r) => rowToExam(r as Record<string, unknown>));
}

export async function upsertExam(userId: string, exam: ExamEntry) {
  const { error } = await getSupabase().from("exams").upsert(examToRow(userId, exam));
  if (error) throw error;
}

export async function deleteExam(id: string) {
  const { error } = await getSupabase().from("exams").delete().eq("id", id);
  if (error) throw error;
}

export async function listLegacyExamDates(userId: string) {
  const { data, error } = await getSupabase().from("exam_dates").select("*").eq("user_id", userId);
  if (error) throw error;
  return data ?? [];
}

// --- Study sessions ---
export async function listStudySessions(userId: string): Promise<StudySession[]> {
  const { data, error } = await getSupabase().from("study_sessions").select("*").eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r) => rowToStudySession(r as Record<string, unknown>));
}

export async function insertStudySession(userId: string, session: StudySession) {
  const { error } = await getSupabase().from("study_sessions").insert(studySessionToRow(userId, session));
  if (error) throw error;
}

// --- Exam checklist ---
export async function listExamChecklist(userId: string): Promise<ExamChecklistItem[]> {
  const { data, error } = await getSupabase().from("exam_checklist").select("*").eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r) => rowToChecklist(r as Record<string, unknown>));
}

export async function upsertChecklistItem(userId: string, item: ExamChecklistItem) {
  const { error } = await getSupabase().from("exam_checklist").upsert({
    id: item.id,
    user_id: userId,
    course_id: item.courseId,
    text: item.text,
    done: item.done,
  });
  if (error) throw error;
}

export async function deleteChecklistItem(id: string) {
  const { error } = await getSupabase().from("exam_checklist").delete().eq("id", id);
  if (error) throw error;
}

// --- Semester ---
export async function getSemester(userId: string): Promise<SemesterPeriod | null> {
  const { data, error } = await getSupabase()
    .from("semester_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return rowToSemester(userId, data as Record<string, unknown>);
}

export async function upsertSemester(semester: SemesterPeriod) {
  const { error } = await getSupabase().from("semester_settings").upsert(semesterToRow(semester));
  if (error) throw error;
}

export async function ensureSemester(userId: string): Promise<SemesterPeriod> {
  const existing = await getSemester(userId);
  if (existing) return existing;
  const initial: SemesterPeriod = { userId, ...defaultSemester() };
  await upsertSemester(initial);
  return initial;
}

// --- Holidays ---
export async function listHolidays(userId: string): Promise<Holiday[]> {
  const { data, error } = await getSupabase().from("holidays").select("*").eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r) => rowToHoliday(r as Record<string, unknown>));
}

export async function upsertHoliday(userId: string, holiday: Holiday) {
  const { error } = await getSupabase().from("holidays").upsert(holidayToRow(userId, holiday));
  if (error) throw error;
}

export async function deleteHoliday(id: string) {
  const { error } = await getSupabase().from("holidays").delete().eq("id", id);
  if (error) throw error;
}

// --- Attendance ---
export async function listAttendanceLogs(userId: string): Promise<AttendanceLog[]> {
  const { data, error } = await getSupabase().from("attendance_logs").select("*").eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r) => rowToAttendance(r as Record<string, unknown>));
}

export async function upsertAttendanceLog(userId: string, log: AttendanceLog) {
  const { error } = await getSupabase().from("attendance_logs").upsert(attendanceToRow(userId, log));
  if (error) throw error;
}

// --- Notification prefs ---
export async function getNotificationPrefs(userId: string, email: string): Promise<NotificationPrefs> {
  const { data, error } = await getSupabase()
    .from("notification_prefs")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    return {
      userId,
      email,
      enabled: false,
      adminFormUrl: getDefaultAdminFormUrl(),
    };
  }
  return rowToNotificationPrefs(userId, data as Record<string, unknown>);
}

export async function upsertNotificationPrefs(prefs: NotificationPrefs) {
  const { error } = await getSupabase().from("notification_prefs").upsert(notificationPrefsToRow(prefs));
  if (error) throw error;
}

// --- System config ---
export type SystemEmailConfig = {
  enabled: boolean;
  adminFormUrl: string;
  lastSyncedAt?: string;
};

export async function getSystemEmailConfig(): Promise<SystemEmailConfig> {
  const { data, error } = await getSupabase()
    .from("system_config")
    .select("data")
    .eq("key", "email")
    .maybeSingle();
  if (error) throw error;
  const d = (data?.data as SystemEmailConfig) ?? {};
  return {
    enabled: !!d.enabled,
    adminFormUrl: d.adminFormUrl || getDefaultAdminFormUrl(),
    lastSyncedAt: d.lastSyncedAt,
  };
}

export async function saveSystemEmailConfig(patch: Partial<SystemEmailConfig>): Promise<SystemEmailConfig> {
  const current = await getSystemEmailConfig();
  const next = { ...current, ...patch };
  const { error } = await getSupabase().from("system_config").upsert({
    key: "email",
    data: next,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  return next;
}

// --- Admin ---
export async function listStudentProfiles() {
  const sb = getSupabase();
  const { data: students, error } = await sb.from("profiles").select("*").eq("role", "student");
  if (error) throw error;

  const weekKey = weekStartKey();

  const profiles = [];
  for (const s of students ?? []) {
    const id = s.id as string;
    const [coursesRes, assignmentsRes, examsRes, studyRes] = await Promise.all([
      sb.from("courses").select("*").eq("user_id", id),
      sb.from("assignments").select("*").eq("user_id", id),
      sb.from("exams").select("*").eq("user_id", id),
      sb.from("study_sessions").select("*").eq("user_id", id),
    ]);
    const courses = (coursesRes.data ?? []).map((r) => rowToCourse(r as Record<string, unknown>));
    const assignments = assignmentsRes.data ?? [];
    const withAttendance = courses.filter((c) => c.totalClasses > 0);
    profiles.push({
      id,
      email: s.email as string,
      username: (s.username as string) ?? usernameFromEmail(s.email as string),
      fullName: s.full_name as string,
      createdAt: s.created_at as string,
      courseCount: courses.length,
      assignmentCount: assignments.length,
      pendingAssignments: assignments.filter((a) => a.status !== "done").length,
      examCount: (examsRes.data ?? []).length,
      studyMinutesThisWeek: (studyRes.data ?? [])
        .filter((row) => (row.date as string) >= weekKey)
        .reduce((sum, row) => sum + Number(row.minutes), 0),
      avgAttendance:
        withAttendance.length > 0
          ? Math.round(withAttendance.reduce((sum, c) => sum + c.attendance, 0) / withAttendance.length)
          : null,
      courses: courses.map((c) => ({
        code: c.code,
        name: c.name,
        attendance: c.attendance,
        marks: c.marks,
        credits: c.credits,
      })),
    });
  }
  return profiles.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listTeamMembers() {
  const { data, error } = await getSupabase()
    .from("profiles")
    .select("*")
    .in("role", ["admin", ...TEAM_ROLES]);
  if (error) throw error;
  return (data ?? [])
    .filter((p) => p.role !== "admin" || false)
    .map((p) => ({
      id: p.id as string,
      email: p.email as string,
      username: p.username as string,
      fullName: p.full_name as string,
      role: p.role as UserRole,
      createdAt: p.created_at as string,
    }));
}

export async function listTeamMembersAll() {
  const { data, error } = await getSupabase()
    .from("profiles")
    .select("*")
    .in("role", TEAM_ROLES);
  if (error) throw error;
  return (data ?? []).map((p) => ({
    id: p.id as string,
    email: p.email as string,
    username: p.username as string,
    fullName: p.full_name as string,
    role: p.role as UserRole,
    createdAt: p.created_at as string,
  }));
}

export async function createTeamMember(input: {
  email: string;
  username: string;
  fullName: string;
  password: string;
  role: UserRole;
}): Promise<{ error?: string }> {
  if (!TEAM_ROLES.includes(input.role)) return { error: "Invalid team role" };
  const sb = getSupabase();
  const normalizedUsername = normalizeUsername(input.username);
  const { data: existing } = await sb.from("profiles").select("id").eq("username", normalizedUsername).maybeSingle();
  if (existing) return { error: "Username is already taken" };

  const { error } = await sb.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      data: {
        username: normalizedUsername,
        full_name: input.fullName.trim(),
        role: input.role,
      },
    },
  });
  if (error) return { error: error.message };
  return {};
}

export async function removeTeamMember(userId: string): Promise<{ error?: string }> {
  const { error } = await getSupabase().from("profiles").update({ role: "student" }).eq("id", userId);
  if (error) return { error: error.message };
  return {};
}

export async function deleteAllUserData(userId: string) {
  const sb = getSupabase();
  const tables = [
    "courses",
    "assignments",
    "notes",
    "routines",
    "exam_dates",
    "exam_checklist",
    "exams",
    "holidays",
    "attendance_logs",
    "study_sessions",
    "semester_settings",
    "notification_prefs",
  ] as const;
  await Promise.all(tables.map((t) => sb.from(t).delete().eq("user_id", userId)));
}

export async function listProfilesByRole(role: UserRole) {
  const { data, error } = await getSupabase().from("profiles").select("*").eq("role", role);
  if (error) throw error;
  return data ?? [];
}
