import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Play, Pause, RotateCcw, Flame, Target, BookOpen,
  Maximize2, Minimize2, Brain, CalendarDays, Clock,
  Sparkles, AlertTriangle, CheckCircle2,
  RefreshCw, Settings2, BarChart3, TrendingUp, TrendingDown,
  Award, Zap, Activity,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from "recharts";
import { useCourses } from "@/lib/coursesStore";
import { useStudy } from "@/lib/studyStore";
import { useExams } from "@/lib/examsStore";
import { formatStudyMinutes, daysUntilDate, todayKey, parseDateKey, dateKey, isPastDate } from "@/lib/scheduleUtils";
import { playTimerEndSound } from "@/lib/timerSound";
import { CourseSelect } from "@/components/CourseSelect";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/study")({
  component: StudyPage,
  head: () => ({ meta: [{ title: "Study Planner · University Command Center" }] }),
});

type Mode = "focus" | "break";

// ─── AI Study Planner engine ────────────────────────────────────────────────

interface PlanBlock {
  courseId: string;
  courseCode: string;
  courseName: string;
  color: string;
  topic: string;
  durationMin: number;
  type: "study" | "revision" | "rest";
}

interface PlanDay {
  dateKey: string;
  label: string;
  daysUntilExam: number | null;
  examTitle: string | null;
  blocks: PlanBlock[];
  totalStudyMin: number;
}

interface PlannerInputs {
  dailyHours: number;
  focusOnWeakTopics: boolean;
  daysAhead: number;
}

const DEFAULT_INPUTS: PlannerInputs = {
  dailyHours: 3,
  focusOnWeakTopics: true,
  daysAhead: 7,
};

function dayLabel(key: string): string {
  const today = todayKey();
  const tomorrow = dateKey(new Date(Date.now() + 86_400_000));
  if (key === today) return "Today";
  if (key === tomorrow) return "Tomorrow";
  return parseDateKey(key).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

function generatePlan(
  courses: ReturnType<typeof useCourses>["courses"],
  exams: ReturnType<typeof useExams>["exams"],
  inputs: PlannerInputs,
): PlanDay[] {
  const totalMinPerDay = inputs.dailyHours * 60;

  const upcoming = exams
    .filter((e) => e.status === "upcoming" && !isPastDate(e.date))
    .sort((a, b) => a.date.localeCompare(b.date));

  type CourseWeight = { courseId: string; weight: number; nextExam: typeof upcoming[0] | null };
  const weights: CourseWeight[] = courses.map((c) => {
    const nextExam = upcoming.find((e) => e.courseId === c.id) ?? null;
    const daysLeft = nextExam ? daysUntilDate(nextExam.date) : 999;
    const weakBonus = (c.weakTopics?.length ?? 0) * 8;
    const urgency = daysLeft < 7 ? 50 : daysLeft < 14 ? 25 : daysLeft < 30 ? 10 : 0;
    return { courseId: c.id, weight: urgency + weakBonus, nextExam };
  });
  weights.sort((a, b) => b.weight - a.weight);

  const days: PlanDay[] = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);

  for (let i = 0; i < inputs.daysAhead; i++) {
    const d = new Date(base.getTime() + i * 86_400_000);
    const dk = dateKey(d);
    const blocks: PlanBlock[] = [];
    let remainingMin = totalMinPerDay;

    const examsOnOrAfter = upcoming.filter((e) => e.date >= dk);
    const nextExamDay = examsOnOrAfter[0] ?? null;
    const daysUntil = nextExamDay ? daysUntilDate(nextExamDay.date) - i : null;
    const isExamDay = upcoming.some((e) => e.date === dk);

    if (isExamDay) {
      const examCourse = courses.find((c) => upcoming.some((e) => e.date === dk && e.courseId === c.id));
      if (examCourse) {
        blocks.push({ courseId: examCourse.id, courseCode: examCourse.code, courseName: examCourse.name, color: examCourse.color, topic: "Final Revision & Mental Preparation", durationMin: Math.min(60, totalMinPerDay), type: "revision" });
      }
      blocks.push({ courseId: "rest", courseCode: "", courseName: "", color: "oklch(0.6 0 0)", topic: "Rest & Stay Calm — Exam Day!", durationMin: 30, type: "rest" });
    } else {
      const activeCourses = weights.filter((w) => w.weight > 0 || courses.length <= 2);
      const totalWeight = activeCourses.reduce((s, w) => s + Math.max(w.weight, 1), 0);

      for (const cw of activeCourses) {
        if (remainingMin <= 0) break;
        const course = courses.find((c) => c.id === cw.courseId);
        if (!course) continue;
        const share = Math.round(((Math.max(cw.weight, 1) / totalWeight) * totalMinPerDay) / 15) * 15;
        const allocated = Math.min(share, remainingMin, 120);
        if (allocated < 15) continue;
        const weak = inputs.focusOnWeakTopics ? (course.weakTopics ?? []) : [];
        const topicPool = weak.length > 0 ? weak : ["Core concepts review", "Practice problems", "Lecture notes revision"];
        const topic = topicPool[i % topicPool.length];
        const nearExam = !!cw.nextExam && daysUntilDate(cw.nextExam.date) <= 3;
        blocks.push({ courseId: course.id, courseCode: course.code, courseName: course.name, color: course.color, topic: nearExam ? `🔥 Intensive Revision: ${topic}` : `Study: ${topic}`, durationMin: allocated, type: nearExam ? "revision" : "study" });
        remainingMin -= allocated;
      }

      if (blocks.length === 0) {
        blocks.push({ courseId: "generic", courseCode: "", courseName: "", color: "oklch(0.65 0.12 265)", topic: "Add courses to get a personalized plan", durationMin: totalMinPerDay, type: "study" });
      }
    }

    days.push({ dateKey: dk, label: dayLabel(dk), daysUntilExam: daysUntil, examTitle: nextExamDay?.title ?? null, blocks, totalStudyMin: blocks.filter((b) => b.type !== "rest").reduce((s, b) => s + b.durationMin, 0) });
  }
  return days;
}

// ─── AI Planner Tab ──────────────────────────────────────────────────────────

function AIStudyPlannerTab() {
  const { courses } = useCourses();
  const { exams } = useExams();
  const [inputs, setInputs] = useState<PlannerInputs>(DEFAULT_INPUTS);
  const [showSettings, setShowSettings] = useState(false);
  const [plan, setPlan] = useState<PlanDay[] | null>(null);
  const [generated, setGenerated] = useState(false);

  const upcomingExams = useMemo(
    () => exams.filter((e) => e.status === "upcoming" && !isPastDate(e.date)).sort((a, b) => a.date.localeCompare(b.date)),
    [exams],
  );

  const generate = useCallback(() => {
    if (courses.length === 0) { toast.error("Add some courses first to generate a plan"); return; }
    setPlan(generatePlan(courses, exams, inputs));
    setGenerated(true);
    toast.success("Study plan generated!");
  }, [courses, exams, inputs]);

  useEffect(() => { if (!generated && courses.length > 0) generate(); }, [courses.length, generated, generate]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="glass-strong relative overflow-hidden rounded-3xl p-6">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-gradient-primary opacity-20 blur-3xl pointer-events-none" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-primary shadow-glow"><Brain className="h-5 w-5 text-primary-foreground" /></div>
              <h2 className="text-xl font-semibold tracking-tight">AI Study Planner</h2>
              <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wider">Smart</span>
            </div>
            <p className="text-xs text-muted-foreground">Day-by-day agenda weighted by exam urgency, weak topics and your daily capacity.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowSettings((p) => !p)} className={`flex items-center gap-2 h-9 rounded-xl border px-4 text-sm font-medium transition cursor-pointer ${showSettings ? "border-primary/40 bg-primary/10 text-primary" : "border-border/60 bg-secondary/40 text-muted-foreground hover:text-foreground"}`}>
              <Settings2 className="h-4 w-4" /> Settings
            </button>
            <button type="button" onClick={generate} className="flex items-center gap-2 h-9 rounded-xl bg-gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-90 transition cursor-pointer">
              <RefreshCw className="h-4 w-4" />{generated ? "Regenerate" : "Generate Plan"}
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="mt-5 pt-5 border-t border-border/40 grid grid-cols-2 gap-4 sm:grid-cols-4 animate-fade-in-up">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Daily Study Hours</label>
              <select value={inputs.dailyHours} onChange={(e) => setInputs((p) => ({ ...p, dailyHours: Number(e.target.value) }))} className="h-9 w-full rounded-xl border border-border/60 bg-secondary/40 px-3 text-sm outline-none focus:border-ring cursor-pointer transition appearance-none">
                {[1, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 8].map((h) => (<option key={h} value={h}>{h}h / day</option>))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Plan Duration</label>
              <select value={inputs.daysAhead} onChange={(e) => setInputs((p) => ({ ...p, daysAhead: Number(e.target.value) }))} className="h-9 w-full rounded-xl border border-border/60 bg-secondary/40 px-3 text-sm outline-none focus:border-ring cursor-pointer transition appearance-none">
                {[3, 5, 7, 10, 14].map((d) => (<option key={d} value={d}>{d} days</option>))}
              </select>
            </div>
            <div className="col-span-2 flex items-center justify-between rounded-2xl border border-border/60 bg-secondary/20 px-4 py-3">
              <div>
                <div className="text-sm font-medium">Focus on Weak Topics</div>
                <div className="text-[11px] text-muted-foreground">Prioritize courses with identified weak areas</div>
              </div>
              <button type="button" role="switch" aria-checked={inputs.focusOnWeakTopics} onClick={() => setInputs((p) => ({ ...p, focusOnWeakTopics: !p.focusOnWeakTopics }))} className={`relative inline-flex h-6 w-11 rounded-full transition-colors cursor-pointer ${inputs.focusOnWeakTopics ? "bg-gradient-primary" : "bg-secondary"}`}>
                <span className={`pointer-events-none inline-block h-4 w-4 translate-y-1 rounded-full bg-white shadow transition-transform ${inputs.focusOnWeakTopics ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upcoming exams strip */}
      {upcomingExams.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {upcomingExams.slice(0, 5).map((e) => {
            const days = daysUntilDate(e.date);
            const urgent = days <= 3;
            const course = courses.find((c) => c.id === e.courseId);
            return (
              <div key={e.id} className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs ${urgent ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-border/60 bg-secondary/40 text-muted-foreground"}`}>
                {urgent ? <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> : <CalendarDays className="h-3.5 w-3.5 shrink-0" />}
                <span className="font-medium">{course?.code ?? "—"}</span>
                <span>{e.title}</span>
                <span className={`font-semibold ${urgent ? "text-destructive" : "text-primary"}`}>{days === 0 ? "Today!" : `${days}d`}</span>
              </div>
            );
          })}
        </div>
      )}

      {courses.length === 0 && (
        <div className="glass-strong rounded-3xl p-12 text-center space-y-4 border border-border/40">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-secondary/60"><Brain className="h-7 w-7 text-muted-foreground" /></div>
          <div><p className="font-medium">No courses yet</p><p className="text-sm text-muted-foreground mt-1">Add your courses and upcoming exams to generate a personalized study plan.</p></div>
        </div>
      )}

      {/* Plan */}
      {plan && (
        <div className="space-y-4">
          {plan.map((day, di) => (
            <article key={day.dateKey} className="glass-strong rounded-3xl p-5 border border-border/40 animate-fade-in-up" style={{ animationDelay: `${di * 40}ms` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-sm font-bold ${di === 0 ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-secondary/60 text-foreground"}`}>{parseDateKey(day.dateKey).getDate()}</div>
                  <div>
                    <div className="font-semibold text-sm">{day.label}</div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />{formatStudyMinutes(day.totalStudyMin)} planned
                      {day.examTitle && day.daysUntilExam !== null && day.daysUntilExam <= 7 && (
                        <span className={`font-semibold ${day.daysUntilExam <= 2 ? "text-destructive" : "text-[color:var(--warning)]"}`}>· Exam in {day.daysUntilExam}d: {day.examTitle}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Sessions</div>
                  <div className="text-sm font-semibold">{day.blocks.filter((b) => b.type !== "rest").length}</div>
                </div>
              </div>

              <div className="space-y-2 pl-3 border-l-2 border-border/40">
                {day.blocks.map((block, bi) => (
                  <div key={bi} className="relative flex items-start gap-3 pl-4">
                    <div className="absolute -left-[9px] top-1.5 h-3 w-3 rounded-full border-2 border-background shrink-0" style={{ background: block.type === "rest" ? "oklch(0.5 0 0)" : block.color }} />
                    <div className={`flex-1 rounded-2xl px-4 py-3 border ${block.type === "rest" ? "border-border/40 bg-secondary/20" : "border-border/40 bg-secondary/30 hover:bg-secondary/50 transition-colors"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          {block.courseCode && (
                            <span className="inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ background: `color-mix(in oklab, ${block.color} 20%, transparent)`, color: block.color }}>{block.courseCode}</span>
                          )}
                          <div className="text-sm font-medium leading-snug">{block.topic}</div>
                          {block.courseName && <div className="text-[11px] text-muted-foreground mt-0.5">{block.courseName}</div>}
                        </div>
                        <div className="shrink-0 text-right">
                          <div className={`rounded-xl px-2.5 py-1 text-xs font-semibold ${block.type === "revision" ? "bg-destructive/10 text-destructive border border-destructive/20" : block.type === "rest" ? "bg-secondary/60 text-muted-foreground" : "bg-primary/10 text-primary border border-primary/20"}`}>{block.durationMin}m</div>
                          <div className="text-[10px] text-muted-foreground mt-1 capitalize">{block.type}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-primary transition-all" style={{ width: `${Math.min(100, (day.totalStudyMin / (inputs.dailyHours * 60)) * 100)}%` }} />
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">{Math.round((day.totalStudyMin / (inputs.dailyHours * 60)) * 100)}% of daily goal</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="glass-strong rounded-3xl p-5 border border-border/40">
        <div className="flex items-center gap-2 mb-3"><Sparkles className="h-4 w-4 text-primary" /><h3 className="text-sm font-semibold">Smart Planning Tips</h3></div>
        <ul className="space-y-2 text-xs text-muted-foreground">
          {["Courses with upcoming exams get more time automatically — add exams on the Exams page.", "Mark weak topics on each course page to boost their priority in the plan.", "Use the Pomodoro timer tab to log study hours for each block.", "Regenerate the plan anytime as your exam dates get closer."].map((tip, i) => (
            <li key={i} className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Study Analytics Tab ─────────────────────────────────────────────────────

function StudyAnalyticsTab() {
  const { courses } = useCourses();
  const { analytics } = useStudy();

  const {
    weeklyByDay, lastWeekByDay,
    totalThisWeek, totalLastWeek, totalThisMonth,
    streak, mostProductiveDay, consistencyScore, minutesByCourse,
  } = analytics;

  const weekTrend = totalLastWeek > 0
    ? Math.round(((totalThisWeek - totalLastWeek) / totalLastWeek) * 100)
    : totalThisWeek > 0 ? 100 : 0;

  const chartData = weeklyByDay.map((d, i) => ({
    ...d,
    lastWeek: lastWeekByDay[i]?.minutes ?? 0,
  }));

  // Course breakdown sorted by most studied
  const courseBreakdown = courses
    .map((c) => ({ ...c, allTimeMin: minutesByCourse[c.id] ?? 0 }))
    .filter((c) => c.allTimeMin > 0)
    .sort((a, b) => b.allTimeMin - a.allTimeMin);
  const maxCourseMin = courseBreakdown[0]?.allTimeMin ?? 1;

  // 28-day heatmap
  const today = todayKey();
  const { sessions } = useStudy();
  const minsForDay = (dk: string) =>
    sessions.filter((s) => s.date === dk).reduce((acc, s) => acc + s.minutes, 0);
  const heatmapDays = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    const dk = dateKey(d);
    return { dk, isToday: dk === today };
  });

  return (
    <div className="space-y-6">
      {/* Header stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="glass-strong rounded-3xl p-5 flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">This Week</span>
          <span className="text-2xl font-bold">{formatStudyMinutes(totalThisWeek)}</span>
          <span className={`text-xs flex items-center gap-1 font-medium ${weekTrend > 0 ? "text-emerald-400" : weekTrend < 0 ? "text-destructive" : "text-muted-foreground"}`}>
            {weekTrend > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : weekTrend < 0 ? <TrendingDown className="h-3.5 w-3.5" /> : null}
            {weekTrend > 0 ? `+${weekTrend}%` : weekTrend < 0 ? `${weekTrend}%` : "No change"} vs last week
          </span>
        </div>
        <div className="glass-strong rounded-3xl p-5 flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">This Month</span>
          <span className="text-2xl font-bold">{formatStudyMinutes(totalThisMonth)}</span>
          <span className="text-xs text-muted-foreground">Calendar month total</span>
        </div>
        <div className="glass-strong rounded-3xl p-5 flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Study Streak</span>
          <span className="text-2xl font-bold flex items-center gap-1.5">
            {streak} {streak > 0 && <Flame className="h-5 w-5 text-orange-400" />}
          </span>
          <span className="text-xs text-muted-foreground">consecutive days</span>
        </div>
        <div className="glass-strong rounded-3xl p-5 flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Consistency</span>
          <span className="text-2xl font-bold">{consistencyScore}%</span>
          <span className="text-xs text-muted-foreground">Last 28 days</span>
        </div>
      </div>

      {/* Weekly bar chart */}
      <div className="glass-strong rounded-3xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> Weekly Study Hours
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">This week vs last week (minutes)</p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-primary inline-block" /> This week</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-muted-foreground/40 inline-block" /> Last week</span>
          </div>
        </div>
        {totalThisWeek === 0 && totalLastWeek === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-secondary/20 text-center">
            <Activity className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No study sessions logged yet.<br />Complete a Pomodoro session to see your stats.</p>
          </div>
        ) : (
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: -20, right: 4, top: 4, bottom: 0 }} barGap={3}>
                <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
                <XAxis dataKey="d" stroke="currentColor" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis stroke="currentColor" tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v) => v > 0 ? `${v}m` : ""} />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number, name: string) => [formatStudyMinutes(v), name === "minutes" ? "This week" : "Last week"]}
                />
                <Bar dataKey="lastWeek" radius={[4, 4, 0, 0]} fill="oklch(0.6 0.05 265 / 0.35)" maxBarSize={28} name="lastWeek" />
                <Bar dataKey="minutes" radius={[4, 4, 0, 0]} maxBarSize={28} name="minutes">
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.minutes > 0 ? "oklch(0.7 0.18 265)" : "oklch(0.6 0.05 265 / 0.2)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 28-day heatmap */}
        <div className="glass-strong rounded-3xl p-6">
          <h2 className="text-base font-semibold flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-primary" /> Activity Heatmap
            <span className="text-[11px] text-muted-foreground font-normal">Last 28 days</span>
          </h2>
          <div className="grid grid-cols-7 gap-1.5">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={i} className="text-center text-[10px] text-muted-foreground font-medium">{d}</div>
            ))}
            {heatmapDays.map(({ dk, isToday }) => {
              const mins = minsForDay(dk);
              const intensity = mins === 0 ? 0 : mins < 30 ? 1 : mins < 60 ? 2 : mins < 120 ? 3 : 4;
              const bg = intensity === 0
                ? "oklch(1 0 0 / 0.05)"
                : intensity === 1 ? "oklch(0.7 0.18 265 / 0.25)"
                : intensity === 2 ? "oklch(0.7 0.18 265 / 0.5)"
                : intensity === 3 ? "oklch(0.7 0.18 265 / 0.75)"
                : "oklch(0.7 0.18 265)";
              return (
                <div
                  key={dk}
                  title={`${dk}: ${mins > 0 ? formatStudyMinutes(mins) : "No study"}`}
                  className={`aspect-square rounded-md transition-transform hover:scale-110 cursor-default ${
                    isToday ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""
                  }`}
                  style={{ background: bg }}
                />
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
            <span>Less</span>
            {[0.05, 0.25, 0.5, 0.75, 1].map((o) => (
              <div key={o} className="h-3 w-3 rounded-sm" style={{ background: o < 0.1 ? "oklch(1 0 0 / 0.05)" : `oklch(0.7 0.18 265 / ${o})` }} />
            ))}
            <span>More</span>
          </div>
        </div>

        {/* Insights panel */}
        <div className="glass-strong rounded-3xl p-6 space-y-4">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" /> Insights
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-secondary/20 p-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: "oklch(0.7 0.18 265 / 0.15)" }}>
                <Award className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium">Most Productive Day</div>
                <div className="text-xs text-muted-foreground">{mostProductiveDay ?? "Study more to find out"}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-secondary/20 p-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: "oklch(0.7 0.18 265 / 0.15)" }}>
                <TrendingUp className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium">Week-over-Week Trend</div>
                <div className={`text-xs font-semibold ${weekTrend > 0 ? "text-emerald-400" : weekTrend < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                  {weekTrend > 0 ? `↑ ${weekTrend}% more than last week` : weekTrend < 0 ? `↓ ${Math.abs(weekTrend)}% less than last week` : "Same as last week"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-secondary/20 p-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: "oklch(0.7 0.18 265 / 0.15)" }}>
                <Flame className="h-4.5 w-4.5 text-orange-400" />
              </div>
              <div>
                <div className="text-sm font-medium">Current Streak</div>
                <div className="text-xs text-muted-foreground">
                  {streak > 0 ? `${streak} day${streak !== 1 ? "s" : ""} — keep going!` : "Start studying today to begin a streak"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-secondary/20 p-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: "oklch(0.7 0.18 265 / 0.15)" }}>
                <Activity className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium">Consistency Score</div>
                <div className="text-xs text-muted-foreground">
                  {consistencyScore >= 70 ? "Excellent consistency! 🎉" : consistencyScore >= 40 ? "Good effort — try to study more days" : "Low consistency — aim for daily sessions"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course breakdown */}
      {courseBreakdown.length > 0 && (
        <div className="glass-strong rounded-3xl p-6">
          <h2 className="text-base font-semibold flex items-center gap-2 mb-5">
            <BookOpen className="h-4 w-4 text-primary" /> Subject-wise Study Time (All time)
          </h2>
          <ul className="space-y-3">
            {courseBreakdown.map((c) => (
              <li key={c.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: `color-mix(in oklab, ${c.color} 20%, transparent)`, color: c.color }}>{c.code}</span>
                    <span className="text-sm font-medium truncate max-w-[180px]">{c.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground shrink-0">{formatStudyMinutes(c.allTimeMin)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(c.allTimeMin / maxCourseMin) * 100}%`, background: c.color }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {courses.length === 0 && (
        <div className="glass-strong rounded-3xl p-12 text-center border border-border/40">
          <BarChart3 className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="font-medium">No analytics yet</p>
          <p className="text-sm text-muted-foreground mt-1">Add courses and complete Pomodoro sessions to see your study statistics.</p>
        </div>
      )}
    </div>
  );
}

function StudyPage() {
  const { courses } = useCourses();
  const { logFocusSession, minutesThisWeek, totalMinutesThisWeek } = useStudy();
  const [activeTab, setActiveTab] = useState<"timer" | "plan" | "analytics">("timer");
  const [subjectId, setSubjectId] = useState("none");
  const [mode, setMode] = useState<Mode>("focus");
  const [focusMin, setFocusMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [customOpen, setCustomOpen] = useState(false);
  const durations = useMemo(
    () => ({ focus: focusMin * 60, break: breakMin * 60 }),
    [focusMin, breakMin],
  );
  const [seconds, setSeconds] = useState(durations.focus);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [streak] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const timerPanelRef = useRef<HTMLElement>(null);
  const subjectIdRef = useRef(subjectId);
  const focusMinRef = useRef(focusMin);
  const breakMinRef = useRef(breakMin);
  const modeRef = useRef(mode);
  const handledZeroRef = useRef(false);

  subjectIdRef.current = subjectId;
  focusMinRef.current = focusMin;
  breakMinRef.current = breakMin;
  modeRef.current = mode;

  const maxCourseMinutes = useMemo(() => {
    if (courses.length === 0) return 0;
    return Math.max(...courses.map((c) => minutesThisWeek(c.id)), 1);
  }, [courses, minutesThisWeek]);

  const applyDuration = useCallback((m: Mode, focus: number, brk: number) => {
    handledZeroRef.current = false;
    const d = { focus: focus * 60, break: brk * 60 };
    setMode(m);
    setSeconds(d[m]);
    setRunning(false);
  }, []);

  const startTimer = () => {
    if (mode === "focus" && courses.length > 0 && subjectId === "none") {
      toast.error("Select a subject before starting focus");
      return;
    }
    handledZeroRef.current = false;
    setRunning(true);
  };

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running || seconds > 0) {
      if (seconds > 0) handledZeroRef.current = false;
      return;
    }
    if (handledZeroRef.current) return;
    handledZeroRef.current = true;

    playTimerEndSound();
    const endedMode = modeRef.current;

    if (endedMode === "focus") {
      setSessions((n) => n + 1);
      const cid = subjectIdRef.current;
      if (cid !== "none") {
        logFocusSession(cid, focusMinRef.current);
        const course = courses.find((c) => c.id === cid);
        toast.success(
          course
            ? `${focusMinRef.current} min logged for ${course.code}`
            : "Focus session logged",
        );
      }
      setMode("break");
      setSeconds(breakMinRef.current * 60);
      toast.info("Break time — timer started automatically");
      setRunning(true);
    } else {
      setMode("focus");
      setSeconds(focusMinRef.current * 60);
      setRunning(false);
      toast.info("Break finished — switch back to focus when you're ready");
    }
  }, [seconds, running, logFocusSession, courses]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === timerPanelRef.current);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    const el = timerPanelRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await el.requestFullscreen();
    } catch {
      toast.error("Fullscreen is not available in this browser");
    }
  };

  const reset = () => {
    handledZeroRef.current = false;
    setRunning(false);
    setSeconds(durations[mode]);
  };

  const total = durations[mode];
  const pct = total > 0 ? ((total - seconds) / total) * 100 : 0;
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const presets = [
    { label: "Classic", focus: 25, brk: 5 },
    { label: "Long focus", focus: 50, brk: 10 },
    { label: "Short", focus: 15, brk: 3 },
  ];

  const selectedCourse = courses.find((c) => c.id === subjectId);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Study Planner</h1>
        <p className="text-sm text-muted-foreground">
          Pomodoro timer, AI schedule, and study analytics — all in one place.
        </p>
      </header>

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-2xl border border-border/60 bg-secondary/30 p-1 w-fit">
        {([
          { key: "timer", label: "⏱ Pomodoro Timer" },
          { key: "plan", label: "🧠 AI Study Plan" },
          { key: "analytics", label: "📊 Analytics" },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition cursor-pointer ${
              activeTab === tab.key
                ? "bg-gradient-primary text-primary-foreground shadow-glow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* AI Plan Tab */}
      {activeTab === "plan" && <AIStudyPlannerTab />}

      {/* Analytics Tab */}
      {activeTab === "analytics" && <StudyAnalyticsTab />}

      {/* Timer Tab */}
      {activeTab === "timer" && <div className="grid gap-6 lg:grid-cols-3">
        <section
          ref={timerPanelRef}
          className="study-timer-panel glass-strong relative overflow-hidden rounded-3xl p-8 text-center lg:col-span-2"
        >
          <div className="absolute inset-0 -z-10 [background:radial-gradient(ellipse_at_top,oklch(0.7_0.18_265/0.18),transparent_60%)]" />

          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={toggleFullscreen}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-3 py-1.5 text-xs font-medium hover:bg-secondary"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen timer"}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="h-3.5 w-3.5" /> Exit fullscreen
                </>
              ) : (
                <>
                  <Maximize2 className="h-3.5 w-3.5" /> Fullscreen
                </>
              )}
            </button>
          </div>

          {courses.length > 0 && mode === "focus" && (
            <div className="mx-auto mb-4 max-w-md rounded-2xl border border-border/60 bg-secondary/30 p-4 text-left">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Subject for this focus session
              </Label>
              <div className="mt-2">
                <CourseSelect
                  value={subjectId}
                  onValueChange={setSubjectId}
                  options={[
                    { value: "none", label: "Select subject…" },
                    ...courses.map((c) => ({ value: c.id, label: `${c.code} — ${c.name}` })),
                  ]}
                />
              </div>
              {selectedCourse && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-[color:var(--cyan)]">
                  <BookOpen className="h-3.5 w-3.5" />
                  Studying {selectedCourse.code} · {formatStudyMinutes(minutesThisWeek(selectedCourse.id))} this week
                </p>
              )}
              {subjectId === "none" && (
                <p className="mt-2 text-xs text-[color:var(--warning)]">Required before you start focus</p>
              )}
            </div>
          )}

          <div className="mx-auto flex w-fit flex-wrap justify-center gap-1 rounded-full border border-border/60 bg-secondary/40 p-1 text-xs">
            {(["focus", "break"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => applyDuration(m, focusMin, breakMin)}
                className={`rounded-full px-4 py-1.5 font-medium capitalize transition ${mode === m ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"}`}
              >
                {m} ({m === "focus" ? focusMin : breakMin}m)
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setFocusMin(p.focus);
                  setBreakMin(p.brk);
                  applyDuration(mode, p.focus, p.brk);
                }}
                className="rounded-full border border-border/60 bg-secondary/40 px-3 py-1 text-xs hover:bg-secondary"
              >
                {p.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCustomOpen((o) => !o)}
              className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary"
            >
              Custom time
            </button>
          </div>

          {customOpen && (
            <div className="mx-auto mt-4 flex max-w-xs flex-wrap items-end justify-center gap-3 rounded-2xl border border-border/60 bg-secondary/30 p-4">
              <div className="space-y-1 text-left">
                <Label className="text-xs">Focus (min)</Label>
                <Input
                  type="number"
                  min={1}
                  max={120}
                  value={focusMin}
                  onChange={(e) => setFocusMin(Math.max(1, Number(e.target.value)))}
                  className="h-9 w-20"
                />
              </div>
              <div className="space-y-1 text-left">
                <Label className="text-xs">Break (min)</Label>
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={breakMin}
                  onChange={(e) => setBreakMin(Math.max(1, Number(e.target.value)))}
                  className="h-9 w-20"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  applyDuration(mode, focusMin, breakMin);
                  setCustomOpen(false);
                }}
                className="rounded-lg bg-gradient-primary px-3 py-2 text-xs font-medium text-primary-foreground"
              >
                Apply
              </button>
            </div>
          )}

          <div className="relative mx-auto mt-8 study-timer-ring h-72 w-72">
            <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
              <circle cx="100" cy="100" r="86" stroke="oklch(1 0 0 / 0.06)" strokeWidth="10" fill="none" />
              <circle
                cx="100"
                cy="100"
                r="86"
                stroke="url(#timer)"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 86}
                strokeDashoffset={(2 * Math.PI * 86) * (1 - pct / 100)}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
              <defs>
                <linearGradient id="timer" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="oklch(0.78 0.14 210)" />
                  <stop offset="100%" stopColor="oklch(0.7 0.18 295)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <div>
                <div className="study-timer-digits text-6xl font-semibold tabular-nums tracking-tight">
                  {mm}:{ss}
                </div>
                <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                  {mode} session
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => (running ? setRunning(false) : startTimer())}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow"
            >
              {running ? (
                <>
                  <Pause className="h-4 w-4" /> Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" /> Start
                </>
              )}
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-secondary/40 px-5 py-3 text-sm font-medium hover:bg-secondary"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="glass-strong rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Today&apos;s sessions</div>
                <div className="mt-1 text-3xl font-semibold">{sessions}</div>
              </div>
              <Target className="h-6 w-6 text-[color:var(--cyan)]" />
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-gradient-primary"
                style={{ width: `${Math.min(100, sessions > 0 ? (sessions / 6) * 100 : 0)}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {formatStudyMinutes(totalMinutesThisWeek)} logged this week total
            </div>
          </div>

          <div className="glass-strong rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Study streak</div>
                <div className="mt-1 flex items-center gap-1 text-3xl font-semibold">
                  {streak} {streak > 0 && <Flame className="h-6 w-6 text-[color:var(--warning)]" />}
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Streak builds when you study daily — starts at zero.</p>
            <div className="mt-3 grid grid-cols-7 gap-1">
              {Array.from({ length: 28 }).map((_, i) => (
                <div key={i} className="aspect-square rounded" style={{ background: "oklch(1 0 0 / 0.05)" }} />
              ))}
            </div>
          </div>

          <div className="glass-strong rounded-3xl p-6">
            <h3 className="text-sm font-semibold">Subject-wise hours (this week)</h3>
            {courses.length === 0 ? (
              <p className="mt-3 text-xs text-muted-foreground">Add courses to track study time per subject.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {courses.map((c) => {
                  const mins = minutesThisWeek(c.id);
                  const barPct = maxCourseMinutes > 0 ? (mins / maxCourseMinutes) * 100 : 0;
                  return (
                    <li key={c.id}>
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">{c.code}</span>
                        <span className="text-muted-foreground">{formatStudyMinutes(mins)}</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full transition-all" style={{ width: `${barPct}%`, background: c.color }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>}
    </div>
  );
}
