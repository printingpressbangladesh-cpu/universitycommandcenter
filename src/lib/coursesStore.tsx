import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { listCourses, listExamDates, setExamDate as saveExamDate, upsertCourse } from "@/lib/supabase/data";
import { onDataChanged } from "@/lib/events";
import type { Course } from "@/lib/types";

export type { Course };

type CoursesContextValue = {
  courses: Course[];
  examDates: Record<string, string>;
  ready: boolean;
  addCourse: (course: Omit<Course, "id" | "attendance" | "attended" | "marks" | "progress" | "weakTopics" | "totalClasses"> & { weakTopics?: string[]; plannedClasses: number }) => void;
  updateCourse: (id: string, patch: Partial<Course>) => void;
  addWeakTopic: (id: string, topic: string) => void;
  removeWeakTopic: (id: string, topic: string) => void;
  setExamDate: (courseId: string, isoDate: string) => void;
};

const CoursesContext = createContext<CoursesContextValue | null>(null);

function recalcAttendance(c: Course): Course {
  const attendance = c.totalClasses > 0 ? Math.round((c.attended / c.totalClasses) * 100) : 0;
  return { ...c, attendance };
}

export function CoursesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [courses, setCourses] = useState<Course[]>([]);
  const [examDates, setExamDates] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);

  const reload = useCallback(async () => {
    if (!userId) {
      setCourses([]);
      setExamDates({});
      setReady(true);
      return;
    }
    try {
      const [rows, exams] = await Promise.all([listCourses(userId), listExamDates(userId)]);
      setCourses(rows);
      setExamDates(exams);
    } catch (e) {
      console.error(e);
    }
    setReady(true);
  }, [userId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => onDataChanged(() => void reload()), [reload]);

  const persistCourse = useCallback(
    async (course: Course) => {
      if (!userId) return;
      await upsertCourse(userId, course);
    },
    [userId],
  );

  const addCourse = useCallback(
    (input: Omit<Course, "id" | "attendance" | "attended" | "marks" | "progress" | "weakTopics" | "totalClasses"> & { weakTopics?: string[]; plannedClasses: number }) => {
      const id = input.code.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString(36);
      const course: Course = recalcAttendance({
        ...input,
        id,
        totalClasses: 0,
        attended: 0,
        marks: 0,
        progress: 0,
        weakTopics: input.weakTopics ?? [],
      });
      setCourses((prev) => [...prev, course]);
      void persistCourse(course);
    },
    [persistCourse],
  );

  const updateCourse = useCallback(
    (id: string, patch: Partial<Course>) => {
      setCourses((prev) => {
        const next = prev.map((c) => {
          if (c.id !== id) return c;
          const updated = recalcAttendance({ ...c, ...patch });
          void persistCourse(updated);
          return updated;
        });
        return next;
      });
    },
    [persistCourse],
  );

  const addWeakTopic = useCallback(
    (id: string, topic: string) => {
      const t = topic.trim();
      if (!t) return;
      setCourses((prev) =>
        prev.map((c) => {
          if (c.id !== id || c.weakTopics.includes(t)) return c;
          const updated = { ...c, weakTopics: [...c.weakTopics, t] };
          void persistCourse(updated);
          return updated;
        }),
      );
    },
    [persistCourse],
  );

  const removeWeakTopic = useCallback(
    (id: string, topic: string) => {
      setCourses((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          const updated = { ...c, weakTopics: c.weakTopics.filter((x) => x !== topic) };
          void persistCourse(updated);
          return updated;
        }),
      );
    },
    [persistCourse],
  );

  const setExamDate = useCallback(
    (courseId: string, isoDate: string) => {
      setExamDates((prev) => ({ ...prev, [courseId]: isoDate }));
      if (userId) void saveExamDate(userId, courseId, isoDate);
    },
    [userId],
  );

  const value = useMemo(
    () => ({ courses, examDates, ready, addCourse, updateCourse, addWeakTopic, removeWeakTopic, setExamDate }),
    [courses, examDates, ready, addCourse, updateCourse, addWeakTopic, removeWeakTopic, setExamDate],
  );

  return <CoursesContext.Provider value={value}>{children}</CoursesContext.Provider>;
}

export function useCourses() {
  const ctx = useContext(CoursesContext);
  if (!ctx) throw new Error("useCourses must be used within CoursesProvider");
  return ctx;
}

export function useCourse(id: string) {
  const { courses } = useCourses();
  return courses.find((c) => c.id === id);
}
