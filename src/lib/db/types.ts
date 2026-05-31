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

export type DbUser = {
  id: string;
  email: string;
  username?: string;
  passwordHash: string;
  salt: string;
  fullName: string;
  role?: UserRole;
  createdAt: string;
};

export type DbSession = {
  id: "current";
  userId: string;
  token: string;
  expiresAt: number;
  isGuest?: boolean;
};

export type StoredCourse = Course & { userId: string };
export type StoredAssignment = Assignment & { userId: string };
export type StoredNote = Note & { userId: string };
export type StoredRoutine = RoutineBlock & { userId: string };
export type StoredExamChecklist = ExamChecklistItem;
export type StoredExam = ExamEntry;
export type StoredSemesterPeriod = SemesterPeriod;
export type StoredHoliday = Holiday;
export type StoredAttendanceLog = AttendanceLog;
export type StoredNotificationPrefs = NotificationPrefs;
export type DbExamDate = { courseId: string; userId: string; isoDate: string };

export type AppUser = {
  id: string;
  email: string;
  user_metadata: {
    full_name: string;
    username?: string;
    role?: UserRole | "guest";
  };
};

export type AppSession = {
  user: AppUser;
  access_token: string;
};
