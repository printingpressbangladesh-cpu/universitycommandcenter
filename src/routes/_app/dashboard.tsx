import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import {
  CalendarCheck2, BookOpen, ClipboardList, Timer, ArrowUpRight, Flame, Quote, Plus,
  AlertTriangle, Bell, TrendingDown, CheckCircle2, Zap,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCourses } from "@/lib/coursesStore";
import { useAssignments } from "@/lib/assignmentsStore";
import { useStudy } from "@/lib/studyStore";
import { formatStudyMinutes } from "@/lib/scheduleUtils";
import { motivationalQuotes } from "@/lib/constants";
import { useSemester } from "@/lib/semesterStore";
import { useExams } from "@/lib/examsStore";
import { calculateSemesterProgress } from "@/lib/semesterTracker";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard · University Command Center" }] }),
});

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  if (h < 21) return "Good Evening";
  return "Good Night";
}

const EMPTY_WEEKLY = [
  { d: "Mon", hrs: 0, focus: 0 },
  { d: "Tue", hrs: 0, focus: 0 },
  { d: "Wed", hrs: 0, focus: 0 },
  { d: "Thu", hrs: 0, focus: 0 },
  { d: "Fri", hrs: 0, focus: 0 },
  { d: "Sat", hrs: 0, focus: 0 },
  { d: "Sun", hrs: 0, focus: 0 },
];

function Dashboard() {
  const { user } = useAuth();
  const { courses, ready } = useCourses();
  const { assignments } = useAssignments();
  const { totalMinutesThisWeek, analytics } = useStudy();
  const { semester } = useSemester();
  const { exams } = useExams();
  const name = (user?.user_metadata?.full_name as string) || user?.email?.split("@")[0] || "Student";

  const coursesWithAttendance = courses.filter((c) => c.totalClasses > 0);
  const overallAttendance =
    coursesWithAttendance.length > 0
      ? Math.round(coursesWithAttendance.reduce((s, c) => s + c.attendance, 0) / coursesWithAttendance.length)
      : null;

  const pending = assignments.filter((a) => a.status !== "done").length;
  const totalCredits = courses.reduce((s, c) => s + c.credits, 0);
  const studyHours = totalMinutesThisWeek;
  const streak = 0;

  const weekly = EMPTY_WEEKLY;

  const [quote, setQuote] = useState(motivationalQuotes[0]);
  useEffect(() => {
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, []);

  const today = assignments
    .filter((a) => a.status !== "done")
    .sort((a, b) => +new Date(a.due) - +new Date(b.due))
    .slice(0, 4);

  const semesterLabel = new Date().getMonth() < 6 ? "Spring" : "Fall";
  const attendanceLabel = overallAttendance !== null ? `${overallAttendance}%` : "—";
  const isEmpty = ready && courses.length === 0;

  const progressMetrics = useMemo(() => {
    if (!semester) {
      return {
        percentComplete: 0,
        daysRemaining: 0,
        totalDays: 0,
        activeAssignmentsCount: 0,
        upcomingExamsCount: 0,
        workloadScore: 0,
        workloadStatus: "balanced" as const,
      };
    }
    return calculateSemesterProgress(
      semester.startDate,
      semester.endDate,
      assignments,
      exams,
      courses
    );
  }, [semester, assignments, exams, courses]);

  const criticalAttendanceCourses = useMemo(() => {
    return courses
      .map((c) => {
        const target = c.targetAttendance ?? 75;
        const attended = c.attended;
        const total = c.totalClasses;
        const current = c.attendance;
        const danger = current < target;

        let mustAttend = 0;
        if (danger && target / 100 < 1) {
          mustAttend = Math.ceil(((target / 100) * total - attended) / (1 - target / 100));
        } else if (danger) {
          mustAttend = Infinity;
        }

        return {
          ...c,
          target,
          danger,
          mustAttend,
        };
      })
      .filter((c) => c.danger && c.totalClasses > 0);
  }, [courses]);

  // ── Smart Insights Engine ───────────────────────────────────────────────────
  type InsightLevel = "critical" | "warning" | "info" | "success";
  interface Insight {
    id: string;
    level: InsightLevel;
    title: string;
    detail: string;
    priority: number;
  }

  const insights = useMemo<Insight[]>(() => {
    const items: Insight[] = [];
    const now = Date.now();

    // 1. Attendance risks
    for (const c of courses) {
      if (c.totalClasses === 0) continue;
      const target = c.targetAttendance ?? 75;
      if (c.attendance < target) {
        const mustAttend = target / 100 < 1
          ? Math.ceil(((target / 100) * c.totalClasses - c.attended) / (1 - target / 100))
          : Infinity;
        items.push({
          id: `att-${c.id}`,
          level: "critical",
          title: `${c.code} attendance is below ${target}%`,
          detail: mustAttend === Infinity
            ? "Target is impossible to recover — speak to your advisor."
            : `Attend next ${mustAttend} class${mustAttend !== 1 ? "es" : ""} consecutively to recover.`,
          priority: 100,
        });
      }
    }

    // 2. Assignments due within 48 hours
    const due48 = assignments.filter((a) => {
      if (a.status === "done") return false;
      const diff = +new Date(a.due) - now;
      return diff > 0 && diff < 48 * 3600 * 1000;
    });
    if (due48.length > 0) {
      items.push({
        id: "due-48h",
        level: "critical",
        title: `${due48.length} assignment${due48.length > 1 ? "s" : ""} due within 48 hours`,
        detail: due48.slice(0, 3).map((a) => a.title).join(", ") + (due48.length > 3 ? " …" : ""),
        priority: 95,
      });
    }

    // 3. Exams within 3 days
    const exams3d = exams.filter((e) => {
      if (e.status !== "upcoming") return false;
      const diff = +new Date(e.date + "T00:00:00") - now;
      return diff > 0 && diff < 3 * 86400 * 1000;
    });
    if (exams3d.length > 0) {
      const course = courses.find((c) => c.id === exams3d[0].courseId);
      items.push({
        id: "exam-3d",
        level: "critical",
        title: `Exam in 3 days: ${course?.code ?? ""} — ${exams3d[0].title}`,
        detail: "Final revision time! Focus on weak topics and past papers.",
        priority: 90,
      });
    }

    // 4. Study performance decline
    const { totalThisWeek, totalLastWeek } = analytics;
    if (totalLastWeek > 0 && totalThisWeek < totalLastWeek * 0.65) {
      const drop = Math.round(((totalLastWeek - totalThisWeek) / totalLastWeek) * 100);
      items.push({
        id: "study-drop",
        level: "warning",
        title: `You studied ${drop}% less than last week`,
        detail: `Last week: ${Math.round(totalLastWeek / 60)}h — This week: ${Math.round(totalThisWeek / 60)}h. Try a Pomodoro session today.`,
        priority: 70,
      });
    }

    // 5. Upcoming exam with no study logged for that course
    const exams14d = exams.filter((e) => {
      if (e.status !== "upcoming") return false;
      const diff = +new Date(e.date + "T00:00:00") - now;
      return diff > 0 && diff < 14 * 86400 * 1000;
    });
    for (const exam of exams14d) {
      const studiedMin = analytics.minutesByCourse[exam.courseId] ?? 0;
      if (studiedMin === 0) {
        const course = courses.find((c) => c.id === exam.courseId);
        items.push({
          id: `no-study-${exam.id}`,
          level: "warning",
          title: `Exam prep needed: ${course?.code ?? ""} — ${exam.title}`,
          detail: "No study sessions logged for this course yet. Start your revision today!",
          priority: 65,
        });
      }
    }

    // 6. Low consistency
    if (courses.length > 0 && analytics.consistencyScore < 30 && analytics.totalThisMonth > 0) {
      items.push({
        id: "low-consistency",
        level: "info",
        title: "Study consistency is low this month",
        detail: `Only ${analytics.consistencyScore}% of days in the past 28 days had study time. Aim for daily sessions.`,
        priority: 40,
      });
    }

    // 7. Good news — all caught up
    if (items.length === 0 && courses.length > 0) {
      items.push({
        id: "all-good",
        level: "success",
        title: "You're all caught up! 🎉",
        detail: "No critical alerts. Keep up the great work and stay consistent.",
        priority: 1,
      });
    }

    return items.sort((a, b) => b.priority - a.priority).slice(0, 6);
  }, [courses, assignments, exams, analytics]);
  return (
    <div className="space-y-6 animate-fade-in-up">
      <section className="glass-strong relative overflow-hidden rounded-3xl p-6 md:p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-primary opacity-30 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-[color:var(--cyan)] opacity-20 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
              {greeting()}, <span className="text-gradient">{name}</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              {isEmpty
                ? "Add your first course to start tracking your semester."
                : `${semesterLabel} ${new Date().getFullYear()} · ${courses.length} course${courses.length !== 1 ? "s" : ""} · ${totalCredits} credits`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="glass rounded-2xl px-4 py-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Attendance</div>
              <div className="text-2xl font-semibold">{attendanceLabel}</div>
            </div>
            <div className="glass rounded-2xl px-4 py-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Streak</div>
              <div className="flex items-center gap-1 text-2xl font-semibold">
                {streak} {streak > 0 && <Flame className="h-5 w-5 text-[color:var(--warning)]" />}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Semester Progress & Workload Tracker */}
      <section className="grid gap-6 md:grid-cols-3">
        {/* Semester Progress Card */}
        <div className="glass-strong rounded-3xl p-6 md:col-span-2 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Semester Progress
              <span className="text-xs font-normal text-muted-foreground">({semester?.label || `${semesterLabel} Semester`})</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              {progressMetrics.daysRemaining} days remaining of {progressMetrics.totalDays} total days
            </p>
          </div>

          <div className="my-5 space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-3xl font-bold tracking-tight">{progressMetrics.percentComplete}%</span>
              <span className="text-xs font-medium text-muted-foreground">Completed</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted/50 p-[1px] border border-border/40">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500"
                style={{ width: `${progressMetrics.percentComplete}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 border-t border-border/40 pt-4 text-center">
            <div>
              <span className="text-[10px] text-muted-foreground block uppercase tracking-wider">Remaining</span>
              <strong className="text-lg font-semibold text-foreground">{progressMetrics.daysRemaining} Days</strong>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block uppercase tracking-wider">Pending Tasks</span>
              <strong className="text-lg font-semibold text-foreground">{progressMetrics.activeAssignmentsCount}</strong>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block uppercase tracking-wider">Upcoming Exams</span>
              <strong className="text-lg font-semibold text-foreground">{progressMetrics.upcomingExamsCount}</strong>
            </div>
          </div>
        </div>

        {/* Workload Meter Card */}
        <div className="glass-strong rounded-3xl p-6 flex flex-col justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Academic Workload</h2>
            <p className="text-xs text-muted-foreground">Overall stress and deadlines score</p>
          </div>

          <div className="my-3 flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center h-28 w-28">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-muted/30"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className={`transition-all duration-500 ease-out ${
                    progressMetrics.workloadStatus === "overloaded"
                      ? "stroke-destructive"
                      : progressMetrics.workloadStatus === "moderate"
                        ? "stroke-warning"
                        : "stroke-success"
                  }`}
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - Math.min(1, (progressMetrics.workloadScore / 50)))}`}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold tracking-tight">{progressMetrics.workloadScore}</span>
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground">SCORE</span>
              </div>
            </div>
          </div>

          <div className="text-center space-y-1">
            <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
              progressMetrics.workloadStatus === "overloaded"
                ? "bg-destructive/15 text-destructive"
                : progressMetrics.workloadStatus === "moderate"
                  ? "bg-warning/15 text-warning"
                  : "bg-success/15 text-success"
            }`}>
              {progressMetrics.workloadStatus === "overloaded" ? "Overloaded" : progressMetrics.workloadStatus === "moderate" ? "Moderate" : "Balanced"}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {progressMetrics.workloadStatus === "overloaded"
                ? "High workload! Prioritize studying and avoid taking on new tasks."
                : progressMetrics.workloadStatus === "moderate"
                  ? "Workload is moderate. Keep up with daily studies."
                  : "Workload is balanced. Excellent time management!"
              }
            </p>
          </div>
        </div>
      </section>

      {/* Critical Attendance Alerts */}
      {criticalAttendanceCourses.length > 0 && (
        <section className="glass-strong border-destructive/20 bg-destructive/5 rounded-3xl p-5">
          <div className="flex items-center gap-2 text-destructive mb-3">
            <Flame className="h-5 w-5 animate-pulse" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Critical Attendance Alerts</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {criticalAttendanceCourses.map((c) => (
              <div key={c.id} className="glass rounded-2xl p-4 flex flex-col justify-between border-destructive/10">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: c.color }}>{c.code}</span>
                    <span className="text-xs font-semibold text-destructive">{c.attendance}% / {c.target}%</span>
                  </div>
                  <h3 className="text-sm font-medium mt-1 truncate">{c.name}</h3>
                </div>
                <p className="text-[11px] text-muted-foreground mt-3">
                  {c.mustAttend === Infinity
                    ? "Target is 100% and classes were missed; target is impossible."
                    : `Attend next ${c.mustAttend} classes consecutively to recover.`}
                </p>
                <Link to="/courses/$courseId" params={{ courseId: c.id }} className="text-xs font-semibold text-primary hover:underline mt-2 self-start flex items-center gap-1">
                  Adjust target / view advisor
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Smart Insights ── */}
      {courses.length > 0 && insights.length > 0 && (
        <section className="glass-strong rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-primary shadow-glow">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Smart Insights</h2>
              <p className="text-[11px] text-muted-foreground">AI-generated alerts & recommendations</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {insights.map((insight) => {
              const colors = {
                critical: { bg: "bg-destructive/10 border-destructive/25", icon: "text-destructive", dot: "bg-destructive" },
                warning: { bg: "bg-[color:var(--warning)]/10 border-[color:var(--warning)]/25", icon: "text-[color:var(--warning)]", dot: "bg-[color:var(--warning)]" },
                info: { bg: "bg-primary/10 border-primary/25", icon: "text-primary", dot: "bg-primary" },
                success: { bg: "bg-emerald-500/10 border-emerald-500/25", icon: "text-emerald-400", dot: "bg-emerald-400" },
              }[insight.level];
              const Icon = insight.level === "critical" ? AlertTriangle
                : insight.level === "warning" ? TrendingDown
                : insight.level === "success" ? CheckCircle2
                : Bell;
              return (
                <div key={insight.id} className={`flex items-start gap-3 rounded-2xl border p-4 ${colors.bg}`}>
                  <div className={`mt-0.5 shrink-0 ${colors.icon}`}><Icon className="h-4 w-4" /></div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold leading-snug">{insight.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{insight.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Attendance" value={attendanceLabel} sub={courses.length ? "Across all courses" : "Log classes to track"} icon={CalendarCheck2} accent="var(--cyan)" />
        <StatCard label="Pending tasks" value={String(pending)} sub={courses.length ? `Across ${courses.length} courses` : "No assignments yet"} icon={ClipboardList} accent="var(--blue)" />
        <StatCard label="Courses" value={String(courses.length)} sub="This semester" icon={BookOpen} accent="var(--purple)" />
        <StatCard label="Study this week" value={formatStudyMinutes(totalMinutesThisWeek)} sub="Use study planner to log time" icon={Timer} accent="var(--success)" />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="glass-strong rounded-3xl p-6 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Weekly focus</h2>
              <p className="text-xs text-muted-foreground">Study hours & focus score</p>
            </div>
            <Link to="/study" className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-3 py-1 text-xs hover:bg-secondary">
              Open planner <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {studyHours < 1 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-secondary/20 text-center">
              <p className="text-sm text-muted-foreground">No study sessions logged this week yet.</p>
              <Link to="/study" className="mt-3 text-sm font-medium text-primary hover:underline">Start a focus session</Link>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weekly} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.7 0.18 265)" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="oklch(0.7 0.18 265)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.78 0.14 210)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="oklch(0.78 0.14 210)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
                  <XAxis dataKey="d" stroke="currentColor" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis stroke="currentColor" tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                    labelStyle={{ color: "var(--foreground)" }}
                  />
                  <Area type="monotone" dataKey="hrs" stroke="oklch(0.7 0.18 265)" strokeWidth={2} fill="url(#g1)" name="Hours" />
                  <Area type="monotone" dataKey="focus" stroke="oklch(0.78 0.14 210)" strokeWidth={2} fill="url(#g2)" name="Focus" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="glass-strong rounded-3xl p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Today & next up</h2>
              <p className="text-xs text-muted-foreground">Sorted by deadline</p>
            </div>
            <Link to="/assignments" className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-3 py-1 text-xs hover:bg-secondary">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {today.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-secondary/20 p-8 text-center text-sm text-muted-foreground">
              No pending assignments. Add tasks from the Assignments page.
            </div>
          ) : (
            <ul className="space-y-2">
              {today.map((t) => {
                const due = new Date(t.due);
                const days = Math.ceil((+due - Date.now()) / 86_400_000);
                return (
                  <li key={t.id} className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-secondary/30 p-3 transition hover-lift">
                    <div className={`h-9 w-1.5 rounded-full ${t.priority === "high" ? "bg-destructive" : t.priority === "medium" ? "bg-[color:var(--warning)]" : "bg-[color:var(--success)]"}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">{t.title}</span>
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{t.course}</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-gradient-primary" style={{ width: `${t.progress}%` }} />
                      </div>
                    </div>
                    <div className="shrink-0 text-right text-xs">
                      <div className="font-medium">{days <= 0 ? "Due today" : `In ${days}d`}</div>
                      <div className="text-muted-foreground">{due.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="glass-strong relative overflow-hidden rounded-3xl p-6">
          <Quote className="absolute -right-2 -top-2 h-24 w-24 text-primary/10" />
          <h3 className="text-sm uppercase tracking-wider text-muted-foreground">Daily dose</h3>
          <p className="mt-3 text-lg leading-snug font-medium">"{quote}"</p>
          <button
            onClick={() => setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)])}
            className="mt-6 inline-flex rounded-xl bg-gradient-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-glow"
          >
            Inspire me again
          </button>
        </div>
      </section>

      <section className="glass-strong rounded-3xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your courses</h2>
          <Link to="/courses" className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-3 py-1 text-xs hover:bg-secondary">
            {courses.length ? "All courses" : "Add course"} <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-secondary/20 py-12 text-center">
            <p className="text-sm text-muted-foreground">You haven&apos;t added any courses yet.</p>
            <Link
              to="/courses"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow"
            >
              <Plus className="h-4 w-4" /> Add your first course
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {courses.map((c) => (
              <Link key={c.id} to="/courses/$courseId" params={{ courseId: c.id }} className="group rounded-2xl border border-border/60 bg-secondary/30 p-4 transition hover-lift">
                <div className="flex items-center justify-between">
                  <span className="rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider" style={{ background: `color-mix(in oklab, ${c.color} 20%, transparent)`, color: c.color }}>
                    {c.code}
                  </span>
                  <span className="text-xs text-muted-foreground">{c.credits} cr</span>
                </div>
                <h3 className="mt-2 line-clamp-2 text-sm font-medium">{c.name}</h3>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full" style={{ width: `${c.progress}%`, background: `linear-gradient(90deg, ${c.color}, var(--accent))` }} />
                </div>
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>{c.totalClasses > 0 ? `${c.attendance}% attendance` : "No classes logged"}</span>
                  <span>Progress: {c.progress}%</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label, value, sub, icon: Icon, accent,
}: { label: string; value: string; sub: string; icon: React.ComponentType<{ className?: string }>; accent: string }) {
  return (
    <div className="glass-strong rounded-2xl p-5 hover-lift">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: `color-mix(in oklab, ${accent} 20%, transparent)`, color: accent }}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 text-3xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}
