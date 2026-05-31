import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import {
  CalendarCheck2, BookOpen, ClipboardList, Timer, ArrowUpRight, Flame, Quote, Plus,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCourses } from "@/lib/coursesStore";
import { useAssignments } from "@/lib/assignmentsStore";
import { useStudy } from "@/lib/studyStore";
import { formatStudyMinutes } from "@/lib/scheduleUtils";
import { motivationalQuotes } from "@/lib/constants";

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
  const { totalMinutesThisWeek } = useStudy();
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

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Attendance" value={attendanceLabel} sub={courses.length ? "Across all courses" : "Log classes to track"} icon={CalendarCheck2} accent="var(--cyan)" />
        <StatCard label="Pending tasks" value={String(pending)} sub={courses.length ? `Across ${courses.length} courses` : "No assignments yet"} icon={ClipboardList} accent="var(--blue)" />
        <StatCard label="Courses" value={String(courses.length)} sub="This semester" icon={BookOpen} accent="var(--purple)" />
        <StatCard label="Study this week" value={`${studyHours}h`} sub="Use study planner to log time" icon={Timer} accent="var(--success)" />
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
                  <span>{c.marks > 0 ? `${c.marks}% marks` : "—"}</span>
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
