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

export type ProfileRow = {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: UserRole;
  created_at: string;
};

export function profileToAppUser(p: ProfileRow) {
  return {
    id: p.id,
    email: p.email,
    user_metadata: {
      full_name: p.full_name,
      username: p.username,
      role: p.role,
    },
  };
}

export function rowToCourse(r: Record<string, unknown>): Course {
  return {
    id: r.id as string,
    code: r.code as string,
    name: r.name as string,
    faculty: (r.faculty as string) ?? "",
    credits: Number(r.credits ?? 0),
    attendance: Number(r.attendance ?? 0),
    totalClasses: Number(r.total_classes ?? 0),
    plannedClasses: Number(r.planned_classes ?? 0),
    attended: Number(r.attended ?? 0),
    marks: Number(r.marks ?? 0),
    progress: Number(r.progress ?? 0),
    weakTopics: (r.weak_topics as string[]) ?? [],
    color: (r.color as string) ?? "#6366f1",
  };
}

export function courseToRow(userId: string, c: Course) {
  return {
    id: c.id,
    user_id: userId,
    code: c.code,
    name: c.name,
    faculty: c.faculty,
    credits: c.credits,
    attendance: c.attendance,
    total_classes: c.totalClasses,
    planned_classes: c.plannedClasses,
    attended: c.attended,
    marks: c.marks,
    progress: c.progress,
    weak_topics: c.weakTopics,
    color: c.color,
  };
}

export function rowToAssignment(r: Record<string, unknown>): Assignment {
  return {
    id: r.id as string,
    title: r.title as string,
    course: r.course as string,
    due: r.due as string,
    priority: r.priority as Assignment["priority"],
    status: r.status as Assignment["status"],
    progress: Number(r.progress ?? 0),
    mark: r.mark != null ? Number(r.mark) : null,
    maxMark: r.max_mark != null ? Number(r.max_mark) : null,
    roomNumber: (r.room_number as string) || null,
    submissionType: (r.submission_type as Assignment["submissionType"]) || null,
  };
}

export function assignmentToRow(userId: string, a: Assignment) {
  return {
    id: a.id,
    user_id: userId,
    title: a.title,
    course: a.course,
    due: a.due,
    priority: a.priority,
    status: a.status,
    progress: a.progress,
    mark: a.mark ?? null,
    max_mark: a.maxMark ?? null,
    room_number: a.roomNumber ?? null,
    submission_type: a.submissionType ?? null,
  };
}

export function rowToNote(r: Record<string, unknown>): Note {
  return {
    id: r.id as string,
    title: r.title as string,
    body: (r.body as string) ?? "",
    course: (r.course as string) || undefined,
    tags: (r.tags as string[]) ?? [],
    pinned: !!r.pinned,
    updatedAt: r.updated_at as string,
  };
}

export function noteToRow(userId: string, n: Note) {
  return {
    id: n.id,
    user_id: userId,
    title: n.title,
    body: n.body,
    course: n.course ?? null,
    tags: n.tags,
    pinned: n.pinned,
    updated_at: n.updatedAt,
  };
}

export function rowToExam(r: Record<string, unknown>): ExamEntry {
  return {
    id: r.id as string,
    userId: r.user_id as string,
    courseId: (r.course_id as string) ?? "",
    title: r.title as string,
    date: (r.date as string).slice(0, 10),
    status: r.status as ExamEntry["status"],
    mark: r.mark != null ? Number(r.mark) : null,
    maxMark: r.max_mark != null ? Number(r.max_mark) : undefined,
    location: (r.location as string) || undefined,
    createdAt: r.created_at as string,
  };
}

export function examToRow(userId: string, e: ExamEntry) {
  return {
    id: e.id,
    user_id: userId,
    course_id: e.courseId || null,
    title: e.title,
    date: e.date,
    status: e.status,
    mark: e.mark ?? null,
    max_mark: e.maxMark ?? 100,
    location: e.location ?? null,
    created_at: e.createdAt,
  };
}

export function rowToRoutine(r: Record<string, unknown>): RoutineBlock {
  return {
    id: r.id as string,
    day: r.day as RoutineBlock["day"],
    start: r.start_time as string,
    end: r.end_time as string,
    title: r.title as string,
    location: (r.location as string) || undefined,
    courseId: (r.course_id as string) || undefined,
    courseCode: (r.course_code as string) || undefined,
    isClass: !!r.is_class,
  };
}

export function routineToRow(userId: string, b: RoutineBlock) {
  return {
    id: b.id,
    user_id: userId,
    day: b.day,
    start_time: b.start,
    end_time: b.end,
    title: b.title,
    location: b.location ?? null,
    course_id: b.courseId ?? null,
    course_code: b.courseCode ?? null,
    is_class: !!b.isClass,
  };
}

export function rowToHoliday(r: Record<string, unknown>): Holiday {
  return {
    id: r.id as string,
    userId: r.user_id as string,
    label: r.label as string,
    startDate: r.start_date as string,
    endDate: (r.end_date as string) || undefined,
    type: r.type as Holiday["type"],
  };
}

export function holidayToRow(userId: string, h: Holiday) {
  return {
    id: h.id,
    user_id: userId,
    label: h.label,
    start_date: h.startDate,
    end_date: h.endDate ?? null,
    type: h.type,
  };
}

export function rowToAttendance(r: Record<string, unknown>): AttendanceLog {
  return {
    id: r.id as string,
    userId: r.user_id as string,
    courseId: r.course_id as string,
    date: r.date as string,
    present: !!r.present,
    routineBlockId: (r.routine_block_id as string) || undefined,
    excuse: (r.excuse as string) || undefined,
    cancelled: !!r.cancelled,
  };
}

export function attendanceToRow(userId: string, l: AttendanceLog) {
  return {
    id: l.id,
    user_id: userId,
    course_id: l.courseId,
    date: l.date,
    present: l.present,
    routine_block_id: l.routineBlockId ?? null,
    excuse: l.excuse ?? null,
    cancelled: !!l.cancelled,
  };
}

export function rowToStudySession(r: Record<string, unknown>): StudySession {
  return {
    id: r.id as string,
    userId: r.user_id as string,
    courseId: r.course_id as string,
    date: (r.date as string).slice(0, 10),
    minutes: Number(r.minutes),
    completedAt: r.completed_at as string,
  };
}

export function studySessionToRow(userId: string, s: StudySession) {
  return {
    id: s.id,
    user_id: userId,
    course_id: s.courseId,
    date: s.date,
    minutes: s.minutes,
    completed_at: s.completedAt,
  };
}

export function rowToChecklist(r: Record<string, unknown>): ExamChecklistItem {
  return {
    id: r.id as string,
    userId: r.user_id as string,
    courseId: r.course_id as string,
    text: r.text as string,
    done: !!r.done,
  };
}

export function rowToSemester(userId: string, r: Record<string, unknown>): SemesterPeriod {
  return {
    userId,
    startDate: r.start_date as string,
    endDate: r.end_date as string,
    label: (r.label as string) || undefined,
  };
}

export function semesterToRow(s: SemesterPeriod) {
  return {
    user_id: s.userId,
    start_date: s.startDate,
    end_date: s.endDate,
    label: s.label ?? null,
  };
}

export function rowToNotificationPrefs(userId: string, r: Record<string, unknown>): NotificationPrefs {
  return {
    userId,
    email: r.email as string,
    enabled: !!r.enabled,
    adminFormUrl: (r.admin_form_url as string) ?? "",
    lastSyncedAt: (r.last_synced_at as string) || undefined,
  };
}

export function notificationPrefsToRow(p: NotificationPrefs) {
  return {
    user_id: p.userId,
    email: p.email,
    enabled: p.enabled,
    admin_form_url: p.adminFormUrl,
    last_synced_at: p.lastSyncedAt ?? null,
  };
}
