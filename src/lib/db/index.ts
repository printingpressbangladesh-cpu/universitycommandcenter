import Dexie, { type Table } from "dexie";
import type {
  DbExamDate,
  DbSession,
  DbUser,
  StoredAssignment,
  StoredCourse,
  StoredNote,
  StoredRoutine,
  StoredExamChecklist,
  StoredExam,
  StoredHoliday,
  StoredAttendanceLog,
  StoredSemesterPeriod,
  StoredNotificationPrefs,
  StudySession,
} from "./types";

export class UniversityDb extends Dexie {
  users!: Table<DbUser, string>;
  sessions!: Table<DbSession, string>;
  courses!: Table<StoredCourse, string>;
  examDates!: Table<DbExamDate, string>;
  routines!: Table<StoredRoutine, string>;
  notes!: Table<StoredNote, string>;
  assignments!: Table<StoredAssignment, string>;
  examChecklist!: Table<StoredExamChecklist, string>;
  exams!: Table<StoredExam, string>;
  semesterSettings!: Table<StoredSemesterPeriod, string>;
  holidays!: Table<StoredHoliday, string>;
  attendanceLogs!: Table<StoredAttendanceLog, string>;
  notificationPrefs!: Table<StoredNotificationPrefs, string>;
  studySessions!: Table<StudySession, string>;
  meta!: Table<{ key: string; migratedAt?: string; data?: unknown }, string>;

  constructor() {
    super("UniversityCommandCenter");
    this.version(1).stores({
      users: "id, &email",
      sessions: "id",
      courses: "id, userId, code",
      examDates: "[courseId+userId], userId",
      routines: "id, userId, day",
      notes: "id, userId, updatedAt",
      assignments: "id, userId, course, due",
      meta: "key",
    });
    this.version(2).stores({
      examChecklist: "id, userId, courseId",
    });
    this.version(3).stores({
      semesterSettings: "userId",
      holidays: "id, userId",
      attendanceLogs: "id, userId, courseId, [courseId+date]",
      notificationPrefs: "userId",
    });
    this.version(4).stores({
      exams: "id, userId, courseId, date, status",
    });
    this.version(5).stores({
      studySessions: "id, userId, courseId, date",
    });
    this.version(6)
      .stores({
        users: "id, &email, &username",
      })
      .upgrade(async (tx) => {
        const users = await tx.table("users").toArray();
        const { usernameFromEmail } = await import("@/lib/username");
        const used = new Set<string>();
        for (const u of users) {
          if (u.username) {
            used.add(u.username);
            continue;
          }
          let base = usernameFromEmail(u.email);
          let candidate = base;
          let n = 0;
          while (used.has(candidate)) {
            n += 1;
            candidate = `${base}${n}`;
          }
          used.add(candidate);
          await tx.table("users").update(u.id, { username: candidate });
        }
      });
  }
}

export const db = new UniversityDb();

export function isDbAvailable() {
  return typeof indexedDB !== "undefined";
}
