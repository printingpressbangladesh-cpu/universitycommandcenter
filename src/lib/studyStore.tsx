import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { insertStudySession, listStudySessions } from "@/lib/supabase/data";
import { dateKey, todayKey, weekStartKey } from "@/lib/scheduleUtils";
import type { StudySession } from "@/lib/types";

// ── Day-of-week helpers ───────────────────────────────────────────────────────
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const DAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

/** YYYY-MM-DD for n days ago */
function daysAgoKey(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return dateKey(d);
}

/** Saturday of a given week offset (0 = this week, -1 = last week) */
function weekStart(offset = 0) {
  const d = new Date();
  const day = d.getDay();
  const diff = (day + 1) % 7;
  d.setDate(d.getDate() - diff + offset * 7);
  d.setHours(0, 0, 0, 0);
  return dateKey(d);
}

export interface DayStudyEntry {
  d: string;        // short day label e.g. "Mon"
  dateKey: string;  // YYYY-MM-DD
  minutes: number;
  hours: number;
}

export interface StudyAnalytics {
  /** Minutes studied per day this week (Mon–Sun) */
  weeklyByDay: DayStudyEntry[];
  /** Minutes studied per day last week (Mon–Sun) */
  lastWeekByDay: DayStudyEntry[];
  /** Total minutes this week */
  totalThisWeek: number;
  /** Total minutes last week */
  totalLastWeek: number;
  /** Total minutes this calendar month */
  totalThisMonth: number;
  /** Current study streak in days */
  streak: number;
  /** Full name of the most productive weekday, or null */
  mostProductiveDay: string | null;
  /** 0–100 consistency score (days with study / last 28 days) */
  consistencyScore: number;
  /** Minutes by courseId across all time */
  minutesByCourse: Record<string, number>;
}

type StudyContextValue = {
  sessions: StudySession[];
  logFocusSession: (courseId: string, minutes: number, reason?: string) => void;
  minutesThisWeek: (courseId: string) => number;
  totalMinutesThisWeek: number;
  analytics: StudyAnalytics;
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
    (courseId: string, minutes: number, reason?: string) => {
      if (!userId || !courseId || minutes < 1) return;
      const entry: StudySession = {
        id: crypto.randomUUID(),
        userId,
        courseId,
        date: todayKey(),
        minutes,
        completedAt: new Date().toISOString(),
        reason,
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

  // ── Analytics ───────────────────────────────────────────────────────────────
  const analytics = useMemo<StudyAnalytics>(() => {
    // Build minute sums per date
    const byDate: Record<string, number> = {};
    for (const s of sessions) {
      byDate[s.date] = (byDate[s.date] ?? 0) + s.minutes;
    }

    // Week grids (Mon=0 → Sun=6)
    function buildWeek(offset: number): DayStudyEntry[] {
      const start = weekStart(offset);
      const startDate = new Date(start + "T00:00:00");
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dk = dateKey(d);
        const mins = byDate[dk] ?? 0;
        return { d: DAYS_SHORT[(d.getDay()) as 0|1|2|3|4|5|6], dateKey: dk, minutes: mins, hours: +(mins / 60).toFixed(1) };
      });
    }

    const weeklyByDay = buildWeek(0);
    const lastWeekByDay = buildWeek(-1);
    const totalThisWeek = weeklyByDay.reduce((s, d) => s + d.minutes, 0);
    const totalLastWeek = lastWeekByDay.reduce((s, d) => s + d.minutes, 0);

    // Monthly total
    const now = new Date();
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const totalThisMonth = sessions
      .filter((s) => s.date.startsWith(monthPrefix))
      .reduce((sum, s) => sum + s.minutes, 0);

    // Study streak: count consecutive days going back from today that had study time
    // Skip Friday (weekend) without breaking the streak if the user did not study.
    let streak = 0;
    let day = 0;
    while (true) {
      const dk = daysAgoKey(day);
      const hasStudied = byDate[dk] && byDate[dk] > 0;
      
      if (hasStudied) {
        streak++;
        day++;
      } else if (day === 0) {
        // Today hasn't been studied yet — don't break streak for today, check yesterday
        day++;
      } else {
        // If it is Friday (weekend), we can skip it without breaking the streak
        const dateObj = new Date(dk + "T00:00:00");
        if (dateObj.getDay() === 5) {
          day++;
        } else {
          break;
        }
      }
    }

    // Most productive day of the week (by average minutes per occurrence)
    const dayTotals: number[] = Array(7).fill(0);
    const dayCounts: number[] = Array(7).fill(0);
    for (const s of sessions) {
      const dow = new Date(s.date + "T00:00:00").getDay();
      dayTotals[dow] += s.minutes;
      dayCounts[dow]++;
    }
    const dayAvgs = dayTotals.map((t, i) => dayCounts[i] > 0 ? t / dayCounts[i] : 0);
    const maxAvg = Math.max(...dayAvgs);
    const mostProductiveDay = maxAvg > 0 ? DAYS_FULL[dayAvgs.indexOf(maxAvg)] : null;

    // Consistency score: % of last 28 days with any study time
    const studiedDays = Array.from({ length: 28 }, (_, i) => daysAgoKey(i)).filter((dk) => (byDate[dk] ?? 0) > 0).length;
    const consistencyScore = Math.round((studiedDays / 28) * 100);

    // Minutes by course
    const minutesByCourse: Record<string, number> = {};
    for (const s of sessions) {
      minutesByCourse[s.courseId] = (minutesByCourse[s.courseId] ?? 0) + s.minutes;
    }

    return {
      weeklyByDay,
      lastWeekByDay,
      totalThisWeek,
      totalLastWeek,
      totalThisMonth,
      streak,
      mostProductiveDay,
      consistencyScore,
      minutesByCourse,
    };
  }, [sessions]);

  const value = useMemo(
    () => ({ sessions, logFocusSession, minutesThisWeek, totalMinutesThisWeek, analytics }),
    [sessions, logFocusSession, minutesThisWeek, totalMinutesThisWeek, analytics],
  );

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error("useStudy must be used within StudyProvider");
  return ctx;
}
