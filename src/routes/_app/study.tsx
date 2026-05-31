import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Flame, Target, BookOpen, Maximize2, Minimize2 } from "lucide-react";
import { useCourses } from "@/lib/coursesStore";
import { useStudy } from "@/lib/studyStore";
import { formatStudyMinutes } from "@/lib/scheduleUtils";
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

function StudyPage() {
  const { courses } = useCourses();
  const { logFocusSession, minutesThisWeek, totalMinutesThisWeek } = useStudy();
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
          Pick a subject, complete a focus session, and time is logged for subject-wise hours.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
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
      </div>
    </div>
  );
}
