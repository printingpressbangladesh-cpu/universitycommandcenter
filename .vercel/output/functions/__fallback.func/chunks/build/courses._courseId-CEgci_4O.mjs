import { U as reactExports, L as jsxRuntimeExports } from "./server-BB9Vuddr.mjs";
import { b as Route2, K as useCourse, I as useAssignments, M as useCourses, N as useExams, e as averageMarkPercent, L as Link } from "./router-CTdYHFOk.mjs";
import { B as Button } from "./button-B_NfezXh.mjs";
import { I as Input } from "./input-B3Kt6F9h.mjs";
import { L as Label } from "./label-BPM5O42P.mjs";
import { c as createLucideIcon } from "./createLucideIcon-CEt2Dx5A.mjs";
import { P as Plus } from "./plus-BYQi9liU.mjs";
import { X } from "./x-hdVcQCsH.mjs";
import { C as ClipboardList } from "./clipboard-list-mEJa_sXH.mjs";
import { B as BookOpen } from "./book-open-49nqEHGe.mjs";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./index-0UuDEara.mjs";
import "./utils-CZ556u-x.mjs";
import "./clsx-DgYk2OaC.mjs";
const __iconNode = [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
];
const ArrowLeft = createLucideIcon("arrow-left", __iconNode);
function CourseDetailPage() {
  const {
    courseId
  } = Route2.useParams();
  const course = useCourse(courseId);
  const {
    assignments
  } = useAssignments();
  const {
    addWeakTopic,
    removeWeakTopic,
    updateCourse
  } = useCourses();
  const {
    exams
  } = useExams();
  const [topic, setTopic] = reactExports.useState("");
  const courseExams = exams.filter((e) => e.courseId === courseId);
  const marksPercent = averageMarkPercent(exams, courseId);
  const displayMarks = course ? marksPercent > 0 ? marksPercent : course.marks : 0;
  if (!course) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Course not found." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/courses", className: "text-primary hover:underline", children: "← Back to courses" })
    ] });
  }
  const tasks = assignments.filter((a) => a.course === course.code);
  const pending = tasks.filter((a) => a.status !== "done");
  const addTopic = (e) => {
    e.preventDefault();
    addWeakTopic(course.id, topic);
    setTopic("");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 animate-fade-in-up", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/courses", className: "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
      " All courses"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "glass-strong rounded-3xl p-6 md:p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wider", style: {
            background: `color-mix(in oklab, ${course.color} 20%, transparent)`,
            color: course.color
          }, children: course.code }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-2 text-2xl font-semibold", children: course.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
            course.faculty,
            " · ",
            course.credits,
            " credits"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Attendance", value: `${course.attendance}%` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Marks", value: displayMarks > 0 ? `${displayMarks}%` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Attended", value: `${course.attended}/${course.totalClasses}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Progress", value: `${course.progress}%` })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(PlannedClassesEditor, { courseId: course.id, planned: course.plannedClasses, onSave: (n) => updateCourse(course.id, {
        plannedClasses: n
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Course progress" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            course.progress,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5 h-2 overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full", style: {
          width: `${course.progress}%`,
          background: `linear-gradient(90deg, ${course.color}, var(--accent))`
        } }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "sr-only", children: "Progress" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "range", min: 0, max: 100, value: course.progress, onChange: (e) => updateCourse(course.id, {
          progress: Number(e.target.value)
        }), className: "w-full max-w-xs" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Drag to update progress" })
      ] })
    ] }),
    courseExams.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "glass-strong rounded-3xl p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Exams" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Marks saved on the Exams page sync here automatically." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-4 space-y-2", children: courseExams.map((ex) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-secondary/30 px-4 py-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: ex.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
            (/* @__PURE__ */ new Date(ex.date + "T00:00:00")).toLocaleDateString(void 0, {
              month: "short",
              day: "numeric",
              year: "numeric"
            }),
            ex.status === "done" ? " · done" : " · upcoming"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right font-semibold", children: ex.mark != null ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          ex.mark,
          ex.maxMark != null ? ` / ${ex.maxMark}` : "",
          ex.maxMark != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-normal text-muted-foreground", children: [
            Math.round(ex.mark / ex.maxMark * 100),
            "%"
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "No mark yet" }) })
      ] }, ex.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "glass-strong rounded-3xl p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Weak topics" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Topics you want extra revision on for this course." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: addTopic, className: "mt-4 flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: topic, onChange: (e) => setTopic(e.target.value), placeholder: "e.g. Normalization, Deadlocks…", className: "flex-1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", size: "sm", className: "bg-gradient-primary text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }) })
      ] }),
      course.weakTopics.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-4 space-y-2", children: course.weakTopics.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between rounded-xl border border-border/60 bg-secondary/30 px-3 py-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => removeWeakTopic(course.id, t), className: "rounded-lg p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive", "aria-label": "Remove", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
      ] }, t)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm text-muted-foreground", children: "No weak topics yet — add any you want to focus on." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "glass-strong rounded-3xl p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-5 w-5 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold", children: [
          "Assignments (",
          pending.length,
          " pending)"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: tasks.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-sm text-muted-foreground", children: "No assignments linked to this course yet." }) : tasks.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between rounded-xl border border-border/60 bg-secondary/30 px-4 py-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: a.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase text-muted-foreground", children: a.status.replace("_", " ") })
      ] }, a.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/assignments", className: "mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "h-4 w-4" }),
        " View all assignments"
      ] })
    ] })
  ] });
}
function Stat({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border/60 bg-secondary/30 px-4 py-3 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-semibold", children: value })
  ] });
}
function PlannedClassesEditor({
  courseId,
  planned,
  onSave
}) {
  const [value, setValue] = reactExports.useState(String(planned));
  const [editing, setEditing] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-xl border border-border/60 bg-secondary/30 p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: "Planned classes (semester)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Total classes you expect this term — edit anytime." })
      ] }),
      !editing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", size: "sm", variant: "secondary", onClick: () => setEditing(true), children: [
        "Edit (",
        planned,
        ")"
      ] }) : null
    ] }),
    editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "mt-3 flex flex-wrap items-end gap-2", onSubmit: (e) => {
      e.preventDefault();
      const n = Number(value);
      if (n < 1) return;
      onSave(n);
      setEditing(false);
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: `planned-${courseId}`, className: "text-xs", children: "Number of classes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: `planned-${courseId}`, type: "number", min: 1, value, onChange: (e) => setValue(e.target.value), className: "w-28" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", size: "sm", children: "Save" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "sm", variant: "ghost", onClick: () => {
        setValue(String(planned));
        setEditing(false);
      }, children: "Cancel" })
    ] })
  ] });
}
export {
  CourseDetailPage as component
};
