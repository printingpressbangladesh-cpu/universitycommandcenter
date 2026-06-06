import { differenceInDays, parseISO, isAfter, isBefore } from "date-fns";
import type { Assignment, ExamEntry, Course } from "@/lib/types";

export interface SemesterProgress {
  percentComplete: number;
  daysRemaining: number;
  totalDays: number;
  activeAssignmentsCount: number;
  upcomingExamsCount: number;
  workloadScore: number;
  workloadStatus: "balanced" | "moderate" | "overloaded";
}

export function calculateSemesterProgress(
  startDateStr: string,
  endDateStr: string,
  assignments: Assignment[],
  exams: ExamEntry[],
  courses: Course[]
): SemesterProgress {
  const now = new Date();
  
  // Strip time from today's date for accurate day calculations
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const start = parseISO(startDateStr);
  const end = parseISO(endDateStr);

  const totalDays = differenceInDays(end, start);
  const elapsedDays = differenceInDays(today, start);

  const percentComplete = totalDays > 0 
    ? Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100))) 
    : 0;
  const daysRemaining = Math.max(0, differenceInDays(end, today));

  // Count active/pending assignments
  const activeAssignmentsCount = assignments.filter(a => a.status !== "done").length;

  // Count upcoming exams
  const upcomingExamsCount = exams.filter(e => e.status === "upcoming" && isAfter(parseISO(e.date), today)).length;

  // Calculate Workload Score
  // 1. Base score from active credits (1.5 per credit)
  let creditsScore = courses.reduce((sum, c) => sum + (c.credits || 0), 0) * 1.5;

  // 2. Score from assignments due in next 7 days
  let assignmentScore = 0;
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  assignments.forEach(a => {
    if (a.status !== "done") {
      const dueDate = parseISO(a.due);
      if (isBefore(dueDate, sevenDaysFromNow) && isAfter(dueDate, today)) {
        const priorityWeight = a.priority === "high" ? 4 : a.priority === "medium" ? 2 : 1;
        assignmentScore += priorityWeight;
      }
    }
  });

  // 3. Score from exams in next 14 days
  let examScore = 0;
  const fourteenDaysFromNow = new Date(today);
  fourteenDaysFromNow.setDate(fourteenDaysFromNow.getDate() + 14);

  exams.forEach(e => {
    if (e.status === "upcoming") {
      const examDate = parseISO(e.date);
      if (isBefore(examDate, fourteenDaysFromNow) && isAfter(examDate, today)) {
        examScore += 5;
      }
    }
  });

  // 4. Score penalty from poor course attendance
  let attendancePenalty = 0;
  courses.forEach(c => {
    const target = c.targetAttendance ?? 75;
    if (c.totalClasses > 0 && c.attendance < target) {
      attendancePenalty += 3;
    }
  });

  const workloadScore = Math.round(creditsScore + assignmentScore + examScore + attendancePenalty);

  let workloadStatus: "balanced" | "moderate" | "overloaded" = "balanced";
  if (workloadScore > 30) workloadStatus = "overloaded";
  else if (workloadScore > 15) workloadStatus = "moderate";

  return {
    percentComplete,
    daysRemaining,
    totalDays,
    activeAssignmentsCount,
    upcomingExamsCount,
    workloadScore,
    workloadStatus,
  };
}
