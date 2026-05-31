import { U as reactExports, L as jsxRuntimeExports } from "./server-BB9Vuddr.mjs";
import { M as useCourses, U as useStudy, F as toast, o as formatStudyMinutes } from "./router-CTdYHFOk.mjs";
import { C as CourseSelect } from "./CourseSelect-BhgjpK3F.mjs";
import { I as Input } from "./input-B3Kt6F9h.mjs";
import { L as Label } from "./label-BPM5O42P.mjs";
import { c as createLucideIcon } from "./createLucideIcon-CEt2Dx5A.mjs";
import { B as BookOpen } from "./book-open-49nqEHGe.mjs";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./select-DHN0rxF_.mjs";
import "./index-BcqomYnJ.mjs";
import "./utils-CZ556u-x.mjs";
import "./clsx-DgYk2OaC.mjs";
import "./check-CvBesx_l.mjs";
import "./index-0UuDEara.mjs";
const __iconNode$6 = [
  [
    "path",
    {
      d: "M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4",
      key: "1slcih"
    }
  ]
];
const Flame = createLucideIcon("flame", __iconNode$6);
const __iconNode$5 = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "m21 3-7 7", key: "1l2asr" }],
  ["path", { d: "m3 21 7-7", key: "tjx5ai" }],
  ["path", { d: "M9 21H3v-6", key: "wtvkvv" }]
];
const Maximize2 = createLucideIcon("maximize-2", __iconNode$5);
const __iconNode$4 = [
  ["path", { d: "m14 10 7-7", key: "oa77jy" }],
  ["path", { d: "M20 10h-6V4", key: "mjg0md" }],
  ["path", { d: "m3 21 7-7", key: "tjx5ai" }],
  ["path", { d: "M4 14h6v6", key: "rmj7iw" }]
];
const Minimize2 = createLucideIcon("minimize-2", __iconNode$4);
const __iconNode$3 = [
  ["rect", { x: "14", y: "3", width: "5", height: "18", rx: "1", key: "kaeet6" }],
  ["rect", { x: "5", y: "3", width: "5", height: "18", rx: "1", key: "1wsw3u" }]
];
const Pause = createLucideIcon("pause", __iconNode$3);
const __iconNode$2 = [
  [
    "path",
    {
      d: "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",
      key: "10ikf1"
    }
  ]
];
const Play = createLucideIcon("play", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
];
const RotateCcw = createLucideIcon("rotate-ccw", __iconNode$1);
const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["circle", { cx: "12", cy: "12", r: "6", key: "1vlfrh" }],
  ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }]
];
const Target = createLucideIcon("target", __iconNode);
function getAudioContext() {
  return null;
}
function playTimerEndSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();
  const now = ctx.currentTime;
  const frequencies = [523.25, 659.25, 783.99];
  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = freq;
    const start = now + i * 0.1;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.22, start + 0.03);
    gain.gain.exponentialRampToValueAtTime(1e-3, start + 0.45);
    osc.start(start);
    osc.stop(start + 0.5);
  });
}
function StudyPage() {
  const {
    courses
  } = useCourses();
  const {
    logFocusSession,
    minutesThisWeek,
    totalMinutesThisWeek
  } = useStudy();
  const [subjectId, setSubjectId] = reactExports.useState("none");
  const [mode, setMode] = reactExports.useState("focus");
  const [focusMin, setFocusMin] = reactExports.useState(25);
  const [breakMin, setBreakMin] = reactExports.useState(5);
  const [customOpen, setCustomOpen] = reactExports.useState(false);
  const durations = reactExports.useMemo(() => ({
    focus: focusMin * 60,
    break: breakMin * 60
  }), [focusMin, breakMin]);
  const [seconds, setSeconds] = reactExports.useState(durations.focus);
  const [running, setRunning] = reactExports.useState(false);
  const [sessions, setSessions] = reactExports.useState(0);
  const [streak] = reactExports.useState(0);
  const [isFullscreen, setIsFullscreen] = reactExports.useState(false);
  const timerPanelRef = reactExports.useRef(null);
  const subjectIdRef = reactExports.useRef(subjectId);
  const focusMinRef = reactExports.useRef(focusMin);
  const breakMinRef = reactExports.useRef(breakMin);
  const modeRef = reactExports.useRef(mode);
  const handledZeroRef = reactExports.useRef(false);
  subjectIdRef.current = subjectId;
  focusMinRef.current = focusMin;
  breakMinRef.current = breakMin;
  modeRef.current = mode;
  const maxCourseMinutes = reactExports.useMemo(() => {
    if (courses.length === 0) return 0;
    return Math.max(...courses.map((c) => minutesThisWeek(c.id)), 1);
  }, [courses, minutesThisWeek]);
  const applyDuration = reactExports.useCallback((m, focus, brk) => {
    handledZeroRef.current = false;
    const d = {
      focus: focus * 60,
      break: brk * 60
    };
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
  reactExports.useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSeconds((s) => s > 0 ? s - 1 : 0);
    }, 1e3);
    return () => clearInterval(id);
  }, [running]);
  reactExports.useEffect(() => {
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
        toast.success(course ? `${focusMinRef.current} min logged for ${course.code}` : "Focus session logged");
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
  reactExports.useEffect(() => {
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
  const pct = total > 0 ? (total - seconds) / total * 100 : 0;
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const presets = [{
    label: "Classic",
    focus: 25,
    brk: 5
  }, {
    label: "Long focus",
    focus: 50,
    brk: 10
  }, {
    label: "Short",
    focus: 15,
    brk: 3
  }];
  const selectedCourse = courses.find((c) => c.id === subjectId);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 animate-fade-in-up", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Study Planner" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Pick a subject, complete a focus session, and time is logged for subject-wise hours." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { ref: timerPanelRef, className: "study-timer-panel glass-strong relative overflow-hidden rounded-3xl p-8 text-center lg:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 -z-10 [background:radial-gradient(ellipse_at_top,oklch(0.7_0.18_265/0.18),transparent_60%)]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: toggleFullscreen, className: "inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-3 py-1.5 text-xs font-medium hover:bg-secondary", title: isFullscreen ? "Exit fullscreen" : "Fullscreen timer", children: isFullscreen ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Minimize2, { className: "h-3.5 w-3.5" }),
          " Exit fullscreen"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize2, { className: "h-3.5 w-3.5" }),
          " Fullscreen"
        ] }) }) }),
        courses.length > 0 && mode === "focus" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto mb-4 max-w-md rounded-2xl border border-border/60 bg-secondary/30 p-4 text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Subject for this focus session" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CourseSelect, { value: subjectId, onValueChange: setSubjectId, options: [{
            value: "none",
            label: "Select subject…"
          }, ...courses.map((c) => ({
            value: c.id,
            label: `${c.code} — ${c.name}`
          }))] }) }),
          selectedCourse && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 flex items-center gap-1.5 text-xs text-[color:var(--cyan)]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "h-3.5 w-3.5" }),
            "Studying ",
            selectedCourse.code,
            " · ",
            formatStudyMinutes(minutesThisWeek(selectedCourse.id)),
            " this week"
          ] }),
          subjectId === "none" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-[color:var(--warning)]", children: "Required before you start focus" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex w-fit flex-wrap justify-center gap-1 rounded-full border border-border/60 bg-secondary/40 p-1 text-xs", children: ["focus", "break"].map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => applyDuration(m, focusMin, breakMin), className: `rounded-full px-4 py-1.5 font-medium capitalize transition ${mode === m ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"}`, children: [
          m,
          " (",
          m === "focus" ? focusMin : breakMin,
          "m)"
        ] }, m)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap justify-center gap-2", children: [
          presets.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
            setFocusMin(p.focus);
            setBreakMin(p.brk);
            applyDuration(mode, p.focus, p.brk);
          }, className: "rounded-full border border-border/60 bg-secondary/40 px-3 py-1 text-xs hover:bg-secondary", children: p.label }, p.label)),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setCustomOpen((o) => !o), className: "rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary", children: "Custom time" })
        ] }),
        customOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto mt-4 flex max-w-xs flex-wrap items-end justify-center gap-3 rounded-2xl border border-border/60 bg-secondary/30 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 text-left", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Focus (min)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, max: 120, value: focusMin, onChange: (e) => setFocusMin(Math.max(1, Number(e.target.value))), className: "h-9 w-20" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 text-left", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Break (min)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, max: 60, value: breakMin, onChange: (e) => setBreakMin(Math.max(1, Number(e.target.value))), className: "h-9 w-20" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
            applyDuration(mode, focusMin, breakMin);
            setCustomOpen(false);
          }, className: "rounded-lg bg-gradient-primary px-3 py-2 text-xs font-medium text-primary-foreground", children: "Apply" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto mt-8 study-timer-ring h-72 w-72", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 200 200", className: "h-full w-full -rotate-90", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "100", cy: "100", r: "86", stroke: "oklch(1 0 0 / 0.06)", strokeWidth: "10", fill: "none" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "100", cy: "100", r: "86", stroke: "url(#timer)", strokeWidth: "10", fill: "none", strokeLinecap: "round", strokeDasharray: 2 * Math.PI * 86, strokeDashoffset: 2 * Math.PI * 86 * (1 - pct / 100), style: {
              transition: "stroke-dashoffset 1s linear"
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "timer", x1: "0", y1: "0", x2: "1", y2: "1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "oklch(0.78 0.14 210)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "oklch(0.7 0.18 295)" })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "study-timer-digits text-6xl font-semibold tabular-nums tracking-tight", children: [
              mm,
              ":",
              ss
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-xs uppercase tracking-wider text-muted-foreground", children: [
              mode,
              " session"
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex justify-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => running ? setRunning(false) : startTimer(), className: "inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow", children: running ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "h-4 w-4" }),
            " Pause"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4" }),
            " Start"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: reset, className: "inline-flex items-center gap-2 rounded-xl border border-border/60 bg-secondary/40 px-5 py-3 text-sm font-medium hover:bg-secondary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-4 w-4" }),
            " Reset"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong rounded-3xl p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Today's sessions" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-3xl font-semibold", children: sessions })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-6 w-6 text-[color:var(--cyan)]" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 h-2 overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-gradient-primary", style: {
            width: `${Math.min(100, sessions > 0 ? sessions / 6 * 100 : 0)}%`
          } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-xs text-muted-foreground", children: [
            formatStudyMinutes(totalMinutesThisWeek),
            " logged this week total"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong rounded-3xl p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: "Study streak" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center gap-1 text-3xl font-semibold", children: [
              streak,
              " ",
              streak > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-6 w-6 text-[color:var(--warning)]" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs text-muted-foreground", children: "Streak builds when you study daily — starts at zero." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 grid grid-cols-7 gap-1", children: Array.from({
            length: 28
          }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square rounded", style: {
            background: "oklch(1 0 0 / 0.05)"
          } }, i)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong rounded-3xl p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Subject-wise hours (this week)" }),
          courses.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs text-muted-foreground", children: "Add courses to track study time per subject." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 space-y-3", children: courses.map((c) => {
            const mins = minutesThisWeek(c.id);
            const barPct = maxCourseMinutes > 0 ? mins / maxCourseMinutes * 100 : 0;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: c.code }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: formatStudyMinutes(mins) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 h-1.5 overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full transition-all", style: {
                width: `${barPct}%`,
                background: c.color
              } }) })
            ] }, c.id);
          }) })
        ] })
      ] })
    ] })
  ] });
}
export {
  StudyPage as component
};
