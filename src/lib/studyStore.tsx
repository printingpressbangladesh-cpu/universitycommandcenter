import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { insertStudySession, listStudySessions } from "@/lib/supabase/data";
import { todayKey, weekStartKey } from "@/lib/scheduleUtils";
import type { StudySession } from "@/lib/types";

type StudyContextValue = {
  sessions: StudySession[];
  logFocusSession: (courseId: string, minutes: number) => void;
  minutesThisWeek: (courseId: string) => number;
  totalMinutesThisWeek: number;
};

const StudyContext = createContext<StudyContextValue | null>(null);

export function StudyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [sessions, setSessions] = useState<StudySession[]>([]);

  const reload = useCallback(async () => {
    if (!userId) {
      setSessions([]);
      return;
    }
    const rows = await listStudySessions(userId);
    setSessions(rows);
  }, [userId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const logFocusSession = useCallback(
    (courseId: string, minutes: number) => {
      if (!userId || !courseId || minutes < 1) return;
      const entry: StudySession = {
        id: crypto.randomUUID(),
        userId,
        courseId,
        date: todayKey(),
        minutes,
        completedAt: new Date().toISOString(),
      };
      setSessions((prev) => [...prev, entry]);
      void insertStudySession(userId, entry);
    },
    [userId],
  );

  const minutesThisWeek = useCallback(
    (courseId: string) => {
      const start = weekStartKey();
      return sessions
        .filter((s) => s.courseId === courseId && s.date >= start)
        .reduce((sum, s) => sum + s.minutes, 0);
    },
    [sessions],
  );

  const totalMinutesThisWeek = useMemo(() => {
    const start = weekStartKey();
    return sessions.filter((s) => s.date >= start).reduce((sum, s) => sum + s.minutes, 0);
  }, [sessions]);

  const value = useMemo(
    () => ({ sessions, logFocusSession, minutesThisWeek, totalMinutesThisWeek }),
    [sessions, logFocusSession, minutesThisWeek, totalMinutesThisWeek],
  );

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error("useStudy must be used within StudyProvider");
  return ctx;
}
