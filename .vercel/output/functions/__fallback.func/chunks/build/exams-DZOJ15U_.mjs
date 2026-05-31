import { U as reactExports, L as jsxRuntimeExports } from "./server-BB9Vuddr.mjs";
import { J as useAuth, M as useCourses, N as useExams, S as useSemester, t as isPastDate, n as formatExamDateLong, j as daysUntilDate, F as toast } from "./router-CTdYHFOk.mjs";
import { I as Input } from "./input-B3Kt6F9h.mjs";
import { L as Label } from "./label-BPM5O42P.mjs";
import { B as Button } from "./button-B_NfezXh.mjs";
import { C as CourseSelect } from "./CourseSelect-BhgjpK3F.mjs";
import { M as Mail } from "./mail-F3NjZY6i.mjs";
import { c as createLucideIcon } from "./createLucideIcon-CEt2Dx5A.mjs";
import { P as Plus } from "./plus-BYQi9liU.mjs";
import { G as GraduationCap } from "./graduation-cap-CUuo92-b.mjs";
import { T as Trash2 } from "./trash-2-rIKLTn3v.mjs";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./utils-CZ556u-x.mjs";
import "./clsx-DgYk2OaC.mjs";
import "./index-0UuDEara.mjs";
import "./select-DHN0rxF_.mjs";
import "./index-BcqomYnJ.mjs";
import "./check-CvBesx_l.mjs";
const __iconNode$1 = [
  [
    "path",
    {
      d: "m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",
      key: "1yiouv"
    }
  ],
  ["circle", { cx: "12", cy: "8", r: "6", key: "1vp47v" }]
];
const Award = createLucideIcon("award", __iconNode$1);
const __iconNode = [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }]
];
const Calendar = createLucideIcon("calendar", __iconNode);
function ExamsPage() {
  const {
    user
  } = useAuth();
  const {
    courses
  } = useCourses();
  const {
    exams,
    addExam,
    markDone,
    setMark,
    removeExam
  } = useExams();
  const {
    syncToGoogle,
    saveNotificationPrefs
  } = useSemester();
  const [courseId, setCourseId] = reactExports.useState("none");
  const [title, setTitle] = reactExports.useState("");
  const [date, setDate] = reactExports.useState("");
  const [maxMark, setMaxMark] = reactExports.useState("");
  const [location, setLocation] = reactExports.useState("");
  const [markDraft, setMarkDraft] = reactExports.useState({});
  const [maxDraft, setMaxDraft] = reactExports.useState({});
  const upcoming = reactExports.useMemo(() => exams.filter((e) => e.status === "upcoming" && !isPastDate(e.date)).sort((a, b) => a.date.localeCompare(b.date)), [exams]);
  const completed = reactExports.useMemo(() => exams.filter((e) => e.status === "done" || isPastDate(e.date)).sort((a, b) => b.date.localeCompare(a.date)), [exams]);
  const latestExam = upcoming[0] ?? null;
  const latestCourse = latestExam ? courses.find((c) => c.id === latestExam.courseId) : void 0;
  const handleAdd = (e) => {
    e.preventDefault();
    if (courseId === "none" || !title.trim() || !date) {
      toast.error("Select a course, title, and exam date");
      return;
    }
    const past = isPastDate(date);
    addExam({
      courseId,
      title: title.trim(),
      date,
      maxMark: maxMark ? Number(maxMark) : void 0,
      location: location.trim() || void 0
    });
    setTitle("");
    setDate("");
    setMaxMark("");
    setLocation("");
    toast.success(past ? "Past exam added — enter your mark below" : "Exam added");
    void syncExamsEmail();
  };
  const syncExamsEmail = async () => {
    try {
      if (user?.email) await saveNotificationPrefs({
        email: user.email
      });
      await syncToGoogle();
      toast.success("Exam schedule synced");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Email sync failed");
    }
  };
  const saveMark = (exam) => {
    const raw = markDraft[exam.id] ?? (exam.mark != null ? String(exam.mark) : "");
    const mark = Number(raw);
    if (!raw || Number.isNaN(mark) || mark < 0) {
      toast.error("Enter a valid mark");
      return;
    }
    const maxRaw = maxDraft[exam.id] ?? (exam.maxMark != null ? String(exam.maxMark) : "");
    const max = maxRaw ? Number(maxRaw) : void 0;
    if (maxRaw && (Number.isNaN(max) || max <= 0)) {
      toast.error("Enter a valid max mark");
      return;
    }
    setMark(exam.id, mark, max);
    toast.success("Mark saved");
    void syncExamsEmail();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 animate-fade-in-up", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "glass-strong relative overflow-hidden rounded-3xl p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-12 -top-12 h-44 w-44 rounded-full bg-gradient-primary opacity-30 blur-3xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-wrap items-end justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Exams" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Schedule exams and record marks. Past dates skip straight to marking. Use Exam Prep for revision." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", className: "gap-2", onClick: () => void syncExamsEmail(), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-4 w-4" }),
          " Sync exam emails"
        ] })
      ] })
    ] }),
    latestExam && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "glass-strong relative overflow-hidden rounded-3xl border border-primary/30 p-6 md:p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-primary opacity-20 blur-2xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-wrap items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-semibold uppercase tracking-wider text-primary", children: "Latest exam" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-1 text-xl font-semibold md:text-2xl", children: latestExam.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 flex items-center gap-1.5 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4 shrink-0" }),
            formatExamDateLong(latestExam.date)
          ] }),
          latestCourse && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-2 inline-block rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wider", style: {
            background: `color-mix(in oklab, ${latestCourse.color} 20%, transparent)`,
            color: latestCourse.color
          }, children: latestCourse.code })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-wider text-muted-foreground", children: "Countdown" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-4xl font-semibold text-gradient", children: [
            daysUntilDate(latestExam.date),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-lg text-muted-foreground", children: "days" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: daysUntilDate(latestExam.date) === 0 ? "Exam is today" : "Until latest exam" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "glass-strong rounded-3xl p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Add exam" }),
      courses.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: "Add a course first, then schedule exams here." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleAdd, className: "mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Course" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CourseSelect, { value: courseId, onValueChange: setCourseId, options: [{
            value: "none",
            label: "Select course"
          }, ...courses.map((c) => ({
            value: c.id,
            label: c.code
          }))] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 sm:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Exam title" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: title, onChange: (e) => setTitle(e.target.value), placeholder: "Midterm, Final, Quiz 2…", required: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: date, onChange: (e) => setDate(e.target.value), required: true }),
          date && isPastDate(date) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-[color:var(--warning)]", children: "Past date — you can add your mark right after saving." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Max mark (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: maxMark, onChange: (e) => setMaxMark(e.target.value), placeholder: "100" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Location (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: location, onChange: (e) => setLocation(e.target.value), placeholder: "Room 301" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end sm:col-span-2 lg:col-span-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", className: "bg-gradient-primary text-primary-foreground shadow-glow", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
          " Add exam"
        ] }) })
      ] })
    ] }),
    upcoming.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold uppercase tracking-wider text-muted-foreground", children: "Upcoming" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2", children: upcoming.map((exam) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "glass-strong rounded-3xl p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExamCardHeader, { exam, course: courses.find((c) => c.id === exam.courseId), onRemove: () => removeExam(exam.id) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-sm text-[color:var(--cyan)]", children: [
          formatExamDateLong(exam.date),
          " ·",
          " ",
          daysUntilDate(exam.date) === 0 ? "today" : `${daysUntilDate(exam.date)} day${daysUntilDate(exam.date) === 1 ? "" : "s"} left`
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", className: "mt-4 w-full", variant: "secondary", onClick: () => {
          markDone(exam.id);
          toast.success("Marked as done — add your mark in Completed");
          void syncExamsEmail();
        }, children: "Exam finished" })
      ] }, exam.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-semibold uppercase tracking-wider text-muted-foreground", children: [
        "Completed ",
        completed.length ? `(${completed.length})` : ""
      ] }),
      completed.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass-strong rounded-3xl p-8 text-center text-sm text-muted-foreground", children: "No completed exams yet. Finished or past-dated exams appear here for marks." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2", children: completed.map((exam) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "glass-strong rounded-3xl p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExamCardHeader, { exam, course: courses.find((c) => c.id === exam.courseId), onRemove: () => removeExam(exam.id) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExamMarkSection, { exam, markDraft, maxDraft, onMarkDraft: setMarkDraft, onMaxDraft: setMaxDraft, onSave: () => saveMark(exam) })
      ] }, exam.id)) })
    ] }),
    exams.length === 0 && courses.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong rounded-3xl p-10 text-center text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(GraduationCap, { className: "mx-auto mb-3 h-10 w-10 opacity-40" }),
      "No exams yet. Add your first exam above — it appears on the Calendar too."
    ] })
  ] });
}
function ExamCardHeader({
  exam,
  course,
  onRemove
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      course && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wider", style: {
        background: `color-mix(in oklab, ${course.color} 20%, transparent)`,
        color: course.color
      }, children: course.code }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-2 text-base font-semibold", children: exam.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 flex items-center gap-1 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3.5 w-3.5" }),
        (/* @__PURE__ */ new Date(exam.date + "T00:00:00")).toLocaleDateString(void 0, {
          weekday: "short",
          month: "short",
          day: "numeric"
        }),
        exam.location ? ` · ${exam.location}` : ""
      ] }),
      exam.maxMark != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "Total marks: ",
        exam.maxMark
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onRemove, className: "rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive", "aria-label": "Remove exam", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
  ] });
}
function ExamMarkSection({
  exam,
  markDraft,
  maxDraft,
  onMarkDraft,
  onMaxDraft,
  onSave
}) {
  if (exam.mark != null) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center gap-2 rounded-xl border border-[color:var(--success)]/40 bg-[color:var(--success)]/10 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-5 w-5 text-[color:var(--success)]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-semibold", children: [
          exam.mark,
          exam.maxMark != null ? ` / ${exam.maxMark}` : "",
          " marks"
        ] }),
        exam.maxMark != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          Math.round(exam.mark / exam.maxMark * 100),
          "%"
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3 rounded-xl border border-border/60 bg-secondary/30 p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Enter your mark for this exam." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Your mark" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: markDraft[exam.id] ?? "", onChange: (e) => onMarkDraft((p) => ({
          ...p,
          [exam.id]: e.target.value
        })), placeholder: "85" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Out of" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: maxDraft[exam.id] ?? (exam.maxMark != null ? String(exam.maxMark) : ""), onChange: (e) => onMaxDraft((p) => ({
          ...p,
          [exam.id]: e.target.value
        })), placeholder: "100" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "sm", className: "w-full", onClick: onSave, children: "Save mark" })
  ] });
}
export {
  ExamsPage as component
};
