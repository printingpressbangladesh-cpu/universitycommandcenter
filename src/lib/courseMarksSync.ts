import type { ExamEntry } from "@/lib/types";
import { getCourse, upsertCourse } from "@/lib/supabase/data";

export function averageMarkPercent(exams: ExamEntry[], courseId: string): number | null {
  const withMarks = exams.filter(
    (e) => e.courseId === courseId && e.status === "done" && e.mark != null && e.maxMark && e.maxMark > 0,
  );
  if (withMarks.length === 0) return null;
  const sum = withMarks.reduce((s, e) => s + ((e.mark ?? 0) / (e.maxMark ?? 100)) * 100, 0);
  return Math.round(sum / withMarks.length);
}

export async function syncCourseMarksFromExams(courseId: string, exams: ExamEntry[]) {
  const course = await getCourse(courseId);
  if (!course) return;
  const avg = averageMarkPercent(exams, courseId);
  if (avg === null) return;
  const { userId, ...rest } = course;
  await upsertCourse(userId, { ...rest, marks: avg });
}

export async function syncAllCourseMarksFromExams(exams: ExamEntry[]) {
  const courseIds = [...new Set(exams.map((e) => e.courseId).filter(Boolean))];
  await Promise.all(courseIds.map((id) => syncCourseMarksFromExams(id, exams)));
}
