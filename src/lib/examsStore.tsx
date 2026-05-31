import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { deleteExam, listExams, listLegacyExamDates, upsertExam } from "@/lib/supabase/data";
import { syncAllCourseMarksFromExams, syncCourseMarksFromExams } from "@/lib/courseMarksSync";
import { emitDataChanged } from "@/lib/events";
import { isPastDate } from "@/lib/scheduleUtils";
import type { ExamEntry } from "@/lib/types";

function statusForDate(date: string): ExamEntry["status"] {
  return isPastDate(date) ? "done" : "upcoming";
}

function normalizeExam(exam: ExamEntry): ExamEntry {
  if (exam.status === "upcoming" && isPastDate(exam.date)) {
    return { ...exam, status: "done" };
  }
  return exam;
}

type ExamsContextValue = {
  exams: ExamEntry[];
  ready: boolean;
  addExam: (input: Omit<ExamEntry, "id" | "userId" | "status" | "createdAt">) => void;
  updateExam: (id: string, patch: Partial<Pick<ExamEntry, "title" | "date" | "location" | "maxMark">>) => void;
  markDone: (id: string) => void;
  setMark: (id: string, mark: number, maxMark?: number) => void;
  removeExam: (id: string) => void;
};

const ExamsContext = createContext<ExamsContextValue | null>(null);

async function migrateLegacyExamDates(userId: string) {
  const [legacy, existing] = await Promise.all([listLegacyExamDates(userId), listExams(userId)]);
  if (existing.length > 0 || legacy.length === 0) return;
  for (const row of legacy) {
    const entry: ExamEntry = {
      id: crypto.randomUUID(),
      userId,
      courseId: row.course_id as string,
      title: "Final exam",
      date: (row.iso_date as string).slice(0, 10),
      status: statusForDate((row.iso_date as string).slice(0, 10)),
      createdAt: new Date().toISOString(),
    };
    await upsertExam(userId, entry);
  }
}

export function ExamsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [exams, setExams] = useState<ExamEntry[]>([]);
  const [ready, setReady] = useState(false);

  const reload = useCallback(async () => {
    if (!userId) {
      setExams([]);
      setReady(true);
      return;
    }
    await migrateLegacyExamDates(userId);
    const rows = await listExams(userId);
    const normalized = rows.map(normalizeExam);
    for (const exam of normalized) {
      const raw = rows.find((r) => r.id === exam.id);
      if (raw && raw.status !== exam.status) await upsertExam(userId, exam);
    }
    const sorted = normalized.sort((a, b) => a.date.localeCompare(b.date));
    await syncAllCourseMarksFromExams(sorted);
    setExams(sorted);
    setReady(true);
    emitDataChanged();
  }, [userId]);

  useEffect(() => {
    setReady(false);
    void reload();
  }, [reload]);

  const addExam = useCallback(
    (input: Omit<ExamEntry, "id" | "userId" | "status" | "createdAt">) => {
      if (!userId) return;
      const entry: ExamEntry = {
        ...input,
        id: crypto.randomUUID(),
        userId,
        status: statusForDate(input.date),
        mark: null,
        createdAt: new Date().toISOString(),
      };
      setExams((prev) => [...prev, entry].sort((a, b) => a.date.localeCompare(b.date)));
      void upsertExam(userId, entry);
      emitDataChanged();
    },
    [userId],
  );

  const updateExam = useCallback(
    (id: string, patch: Partial<Pick<ExamEntry, "title" | "date" | "location" | "maxMark">>) => {
      if (!userId) return;
      setExams((prev) => {
        const next = prev.map((e) => {
          if (e.id !== id) return e;
          const merged = { ...e, ...patch };
          if (patch.date) merged.status = statusForDate(patch.date);
          return merged;
        });
        const updated = next.find((e) => e.id === id);
        if (updated) void upsertExam(userId, updated);
        return next.sort((a, b) => a.date.localeCompare(b.date));
      });
      emitDataChanged();
    },
    [userId],
  );

  const markDone = useCallback(
    (id: string) => {
      if (!userId) return;
      setExams((prev) => {
        const next = prev.map((e) => (e.id === id ? { ...e, status: "done" as const } : e));
        const updated = next.find((e) => e.id === id);
        if (updated) void upsertExam(userId, updated);
        return next;
      });
      emitDataChanged();
    },
    [userId],
  );

  const setMark = useCallback(
    (id: string, mark: number, maxMark?: number) => {
      if (!userId) return;
      setExams((prev) => {
        const next = prev.map((e) =>
          e.id === id ? { ...e, mark, maxMark: maxMark ?? e.maxMark, status: "done" as const } : e,
        );
        const updated = next.find((e) => e.id === id);
        if (updated) {
          void upsertExam(userId, updated);
          void syncCourseMarksFromExams(updated.courseId, next);
        }
        return next;
      });
      emitDataChanged();
    },
    [userId],
  );

  const removeExam = useCallback(
    (id: string) => {
      if (!userId) return;
      setExams((prev) => {
        const removed = prev.find((e) => e.id === id);
        const next = prev.filter((e) => e.id !== id);
        void deleteExam(id);
        if (removed) void syncCourseMarksFromExams(removed.courseId, next);
        return next;
      });
      emitDataChanged();
    },
    [userId],
  );

  const value = useMemo(
    () => ({ exams, ready, addExam, updateExam, markDone, setMark, removeExam }),
    [exams, ready, addExam, updateExam, markDone, setMark, removeExam],
  );

  return <ExamsContext.Provider value={value}>{children}</ExamsContext.Provider>;
}

export function useExams() {
  const ctx = useContext(ExamsContext);
  if (!ctx) throw new Error("useExams must be used within ExamsProvider");
  return ctx;
}
