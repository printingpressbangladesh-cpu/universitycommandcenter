import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import {
  ensureSemester,
  getCourse,
  getNotificationPrefs,
  listAssignments,
  listCourses,
  listExams,
  listExamDates,
  listHolidays,
  listAttendanceLogs,
  listRoutines,
  upsertAttendanceLog,
  upsertCourse,
  upsertHoliday,
  upsertNotificationPrefs,
  upsertSemester,
  deleteHoliday,
} from "@/lib/supabase/data";
import { getSystemEmailConfig, saveSystemEmailConfig } from "@/lib/systemConfig";
import { syncNotifications, getDefaultAdminFormUrl } from "@/lib/notificationsApi";
import { emitDataChanged } from "@/lib/events";
import { todayKey } from "@/lib/scheduleUtils";
import type { AttendanceLog, Holiday, NotificationPrefs, SemesterPeriod } from "@/lib/types";

type SemesterContextValue = {
  semester: SemesterPeriod | null;
  holidays: Holiday[];
  attendanceLogs: AttendanceLog[];
  prefs: NotificationPrefs | null;
  setSemester: (patch: Partial<SemesterPeriod>) => void;
  addHoliday: (h: Omit<Holiday, "id" | "userId">) => void;
  removeHoliday: (id: string) => void;
  recordClassAttendance: (params: {
    courseId: string;
    routineBlockId?: string;
    date: string;
    present: boolean;
    excuse?: string;
  }) => { ok: boolean; error?: string };
  cancelClass: (params: {
    courseId: string;
    routineBlockId: string;
    date: string;
    excuse?: string;
  }) => { ok: boolean; error?: string };
  getLogForSession: (courseId: string, date: string, routineBlockId?: string) => AttendanceLog | undefined;
  lastAttendanceDate: string | null;
  saveNotificationPrefs: (patch: Partial<NotificationPrefs>) => Promise<void>;
  syncToGoogle: () => Promise<void>;
};

const SemesterContext = createContext<SemesterContextValue | null>(null);

function recalcCourseFromLogs(
  courseId: string,
  logs: AttendanceLog[],
): { totalClasses: number; attended: number; attendance: number } {
  const forCourse = logs.filter((l) => l.courseId === courseId && !l.cancelled);
  const totalClasses = forCourse.length;
  const attended = forCourse.filter((l) => l.present).length;
  const attendance = totalClasses > 0 ? Math.round((attended / totalClasses) * 100) : 0;
  return { totalClasses, attended, attendance };
}

function findSessionLog(logs: AttendanceLog[], courseId: string, date: string, routineBlockId?: string) {
  if (routineBlockId) {
    const byBlock = logs.find((l) => l.routineBlockId === routineBlockId && l.date === date);
    if (byBlock) return byBlock;
  }
  return logs.find((l) => l.courseId === courseId && l.date === date && !l.routineBlockId);
}

export function SemesterProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [semester, setSemesterState] = useState<SemesterPeriod | null>(null);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const [sem, hols, logs, pref] = await Promise.all([
        ensureSemester(userId),
        listHolidays(userId),
        listAttendanceLogs(userId),
        getNotificationPrefs(userId, user?.email ?? ""),
      ]);
      if (cancelled) return;
      setSemesterState(sem);
      setHolidays(hols);
      setAttendanceLogs(logs);
      setPrefs(pref);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, user?.email]);

  const setSemester = useCallback(
    (patch: Partial<SemesterPeriod>) => {
      if (!userId) return;
      setSemesterState((prev) => {
        const base = prev ?? { userId, startDate: "", endDate: "" };
        const next = { ...base, ...patch, userId };
        void upsertSemester(next);
        return next;
      });
    },
    [userId],
  );

  const addHoliday = useCallback(
    (h: Omit<Holiday, "id" | "userId">) => {
      if (!userId) return;
      const entry: Holiday = { ...h, id: crypto.randomUUID(), userId };
      setHolidays((p) => [...p, entry]);
      void upsertHoliday(userId, entry);
    },
    [userId],
  );

  const removeHoliday = useCallback((id: string) => {
    setHolidays((p) => p.filter((h) => h.id !== id));
    void deleteHoliday(id);
  }, []);

  const getLogForSession = useCallback(
    (courseId: string, date: string, routineBlockId?: string) =>
      findSessionLog(attendanceLogs, courseId, date, routineBlockId),
    [attendanceLogs],
  );

  const recordClassAttendance = useCallback(
    (params: {
      courseId: string;
      routineBlockId?: string;
      date: string;
      present: boolean;
      excuse?: string;
    }): { ok: boolean; error?: string } => {
      if (!userId) return { ok: false, error: "Not signed in" };
      const today = todayKey();
      if (params.date !== today && !(params.excuse ?? "").trim()) {
        return {
          ok: false,
          error: "Provide a reason when marking attendance for a day other than today.",
        };
      }
      const existing = findSessionLog(
        attendanceLogs,
        params.courseId,
        params.date,
        params.routineBlockId,
      );
      const entry: AttendanceLog = existing
        ? {
            ...existing,
            present: params.present,
            cancelled: false,
            excuse: params.date !== today ? params.excuse?.trim() : undefined,
          }
        : {
            id: crypto.randomUUID(),
            userId,
            courseId: params.courseId,
            date: params.date,
            present: params.present,
            cancelled: false,
            routineBlockId: params.routineBlockId,
            excuse: params.date !== today ? params.excuse?.trim() : undefined,
          };

      setAttendanceLogs((prev) => {
        const next = existing
          ? prev.map((l) => (l.id === existing.id ? entry : l))
          : [...prev, entry];
        const stats = recalcCourseFromLogs(params.courseId, next);
        void (async () => {
          await upsertAttendanceLog(userId, entry);
          const course = await getCourse(params.courseId);
          if (course) {
            const { userId: uid, ...rest } = course;
            await upsertCourse(uid, { ...rest, ...stats });
          }
        })();
        return next;
      });

      emitDataChanged();
      return { ok: true };
    },
    [userId, attendanceLogs],
  );

  const cancelClass = useCallback(
    (params: {
      courseId: string;
      routineBlockId: string;
      date: string;
      excuse?: string;
    }): { ok: boolean; error?: string } => {
      if (!userId) return { ok: false, error: "Not signed in" };
      const today = todayKey();
      if (params.date !== today && !(params.excuse ?? "").trim()) {
        return {
          ok: false,
          error: "Provide a reason when marking a cancellation for a day other than today.",
        };
      }
      const existing = findSessionLog(
        attendanceLogs,
        params.courseId,
        params.date,
        params.routineBlockId,
      );
      const entry: AttendanceLog = existing
        ? {
            ...existing,
            cancelled: true,
            present: false,
            excuse: params.date !== today ? params.excuse?.trim() : undefined,
          }
        : {
            id: crypto.randomUUID(),
            userId,
            courseId: params.courseId,
            date: params.date,
            present: false,
            cancelled: true,
            routineBlockId: params.routineBlockId,
            excuse: params.date !== today ? params.excuse?.trim() : undefined,
          };

      setAttendanceLogs((prev) => {
        const next = existing
          ? prev.map((l) => (l.id === existing.id ? entry : l))
          : [...prev, entry];
        const stats = recalcCourseFromLogs(params.courseId, next);
        void (async () => {
          await upsertAttendanceLog(userId, entry);
          const course = await getCourse(params.courseId);
          if (course) {
            const { userId: uid, ...rest } = course;
            await upsertCourse(uid, { ...rest, ...stats });
          }
        })();
        return next;
      });

      emitDataChanged();
      return { ok: true };
    },
    [userId, attendanceLogs],
  );

  const lastAttendanceDate = useMemo(() => {
    if (attendanceLogs.length === 0) return null;
    return attendanceLogs.map((l) => l.date).sort().at(-1) ?? null;
  }, [attendanceLogs]);

  const saveNotificationPrefs = useCallback(
    async (patch: Partial<NotificationPrefs>) => {
      if (!userId) return;
      const next: NotificationPrefs = {
        ...(prefs ?? {
          userId,
          email: user?.email ?? "",
          enabled: false,
          adminFormUrl: getDefaultAdminFormUrl(),
        }),
        ...patch,
        userId,
      };
      setPrefs(next);
      await upsertNotificationPrefs(next);
    },
    [userId, prefs, user?.email],
  );

  const syncToGoogle = useCallback(async () => {
    if (!userId) return;
    const system = await getSystemEmailConfig();
    if (!system.enabled) {
      throw new Error("Email reminders are disabled. An administrator must enable them in Admin.");
    }
    const email = (user?.email ?? "").trim();
    if (!email) {
      throw new Error("Sign in with your student account to sync data for emails.");
    }
    const [routine, courses, assignments, examRows, userExams] = await Promise.all([
      listRoutines(userId),
      listCourses(userId),
      listAssignments(userId),
      listExamDates(userId),
      listExams(userId),
    ]);

    const examDatesArr = Object.entries(examRows).map(([courseId, isoDate]) => {
      const c = courses.find((x) => x.id === courseId);
      return { courseId, courseCode: c?.code ?? "", date: isoDate };
    });

    await syncNotifications(email, {
      semester: semester
        ? { startDate: semester.startDate, endDate: semester.endDate, label: semester.label }
        : null,
      holidays: holidays.map((h) => ({
        label: h.label,
        startDate: h.startDate,
        endDate: h.endDate,
        type: h.type,
      })),
      routine,
      courses: courses.map((c) => ({ id: c.id, code: c.code, name: c.name })),
      assignments: assignments.map((a) => ({
        title: a.title,
        course: a.course,
        due: a.due,
        status: a.status,
        priority: a.priority,
        roomNumber: a.roomNumber ?? null,
        submissionType: a.submissionType ?? null,
      })),
      examDates: examDatesArr,
      exams: userExams.map((ex) => {
        const c = courses.find((x) => x.id === ex.courseId);
        return {
          id: ex.id,
          courseId: ex.courseId,
          courseCode: c?.code ?? "",
          title: ex.title,
          date: ex.date,
          status: ex.status,
          mark: ex.mark ?? null,
          maxMark: ex.maxMark,
          location: ex.location ?? null,
          createdAt: ex.createdAt,
        };
      }),
      lastAttendanceDate,
      notificationsEnabled: system.enabled,
      adminFormUrl: system.adminFormUrl || getDefaultAdminFormUrl(),
    });

    const syncedAt = new Date().toISOString();
    await saveSystemEmailConfig({ lastSyncedAt: syncedAt });
    if (prefs) await saveNotificationPrefs({ lastSyncedAt: syncedAt });
  }, [prefs, user, userId, semester, holidays, lastAttendanceDate, saveNotificationPrefs]);

  const value = useMemo(
    () => ({
      semester,
      holidays,
      attendanceLogs,
      prefs,
      setSemester,
      addHoliday,
      removeHoliday,
      recordClassAttendance,
      cancelClass,
      getLogForSession,
      lastAttendanceDate,
      saveNotificationPrefs,
      syncToGoogle,
    }),
    [
      semester,
      holidays,
      attendanceLogs,
      prefs,
      setSemester,
      addHoliday,
      removeHoliday,
      recordClassAttendance,
      cancelClass,
      getLogForSession,
      lastAttendanceDate,
      saveNotificationPrefs,
      syncToGoogle,
    ],
  );

  return <SemesterContext.Provider value={value}>{children}</SemesterContext.Provider>;
}

export function useSemester() {
  const ctx = useContext(SemesterContext);
  if (!ctx) throw new Error("useSemester must be used within SemesterProvider");
  return ctx;
}
