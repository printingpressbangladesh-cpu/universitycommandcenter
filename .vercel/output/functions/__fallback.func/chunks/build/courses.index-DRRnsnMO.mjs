import { U as reactExports, L as jsxRuntimeExports } from "./server-BB9Vuddr.mjs";
import { O as useNavigate, M as useCourses, I as useAssignments } from "./router-CTdYHFOk.mjs";
import { B as Button } from "./button-B_NfezXh.mjs";
import { I as Input } from "./input-B3Kt6F9h.mjs";
import { L as Label } from "./label-BPM5O42P.mjs";
import { D as Dialog, d as DialogTrigger, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-BmgT1gFM.mjs";
import { C as CourseSelect } from "./CourseSelect-BhgjpK3F.mjs";
import { P as Plus } from "./plus-BYQi9liU.mjs";
import { c as createLucideIcon } from "./createLucideIcon-CEt2Dx5A.mjs";
import { T as TriangleAlert } from "./triangle-alert-imR-iVh_.mjs";
import { B as BookOpen } from "./book-open-49nqEHGe.mjs";
import { C as ChevronRight } from "./chevron-right-B7tSAgOS.mjs";
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
import "./index-BcqomYnJ.mjs";
import "./select-DHN0rxF_.mjs";
import "./check-CvBesx_l.mjs";
import "./index-B1Mostm-.mjs";
import "./x-hdVcQCsH.mjs";
const __iconNode = [
  [
    "path",
    {
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ],
  ["path", { d: "m15 5 4 4", key: "1mk7zo" }]
];
const Pencil = createLucideIcon("pencil", __iconNode);
const COLORS = ["var(--blue)", "var(--purple)", "var(--cyan)", "var(--success)", "var(--warning)"];
function CoursesPage() {
  const navigate = useNavigate();
  const {
    courses,
    addCourse,
    updateCourse
  } = useCourses();
  const {
    assignments
  } = useAssignments();
  const [open, setOpen] = reactExports.useState(false);
  const [editId, setEditId] = reactExports.useState(null);
  const [editPlanned, setEditPlanned] = reactExports.useState(28);
  const [code, setCode] = reactExports.useState("");
  const [name, setName] = reactExports.useState("");
  const [faculty, setFaculty] = reactExports.useState("");
  const [credits, setCredits] = reactExports.useState(3);
  const [plannedClasses, setPlannedClasses] = reactExports.useState(28);
  const [color, setColor] = reactExports.useState(COLORS[0]);
  const resetForm = () => {
    setCode("");
    setName("");
    setFaculty("");
    setCredits(3);
    setPlannedClasses(28);
    setColor(COLORS[0]);
  };
  const handleAdd = (e) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;
    addCourse({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      faculty: faculty.trim() || "TBA",
      credits,
      plannedClasses,
      color,
      weakTopics: []
    });
    setOpen(false);
    resetForm();
  };
  const savePlanned = (e) => {
    e.preventDefault();
    if (!editId || editPlanned < 1) return;
    updateCourse(editId, {
      plannedClasses: editPlanned
    });
    setEditId(null);
  };
  const totalCredits = courses.reduce((s, c) => s + c.credits, 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 animate-fade-in-up", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Courses" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          courses.length,
          " courses · ",
          totalCredits,
          " credits"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: setOpen, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "bg-gradient-primary text-primary-foreground shadow-glow", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
          " Add course"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "glass-strong max-w-md rounded-3xl border-border/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Add a course" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleAdd, className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Course code" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: code, onChange: (e) => setCode(e.target.value), placeholder: "CSE311", required: true })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Credits" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, max: 6, value: credits, onChange: (e) => setCredits(Number(e.target.value)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Course name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: name, onChange: (e) => setName(e.target.value), placeholder: "Database Systems", required: true })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Faculty" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: faculty, onChange: (e) => setFaculty(e.target.value), placeholder: "Dr. Smith" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Planned classes (semester)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, value: plannedClasses, onChange: (e) => setPlannedClasses(Number(e.target.value)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Accent color" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CourseSelect, { value: color, onValueChange: setColor, options: COLORS.map((c, i) => ({
                value: c,
                label: `Color ${i + 1}`
              })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full bg-gradient-primary text-primary-foreground", children: "Save course" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!editId, onOpenChange: (o) => !o && setEditId(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "glass-strong max-w-sm rounded-3xl border-border/60", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Edit planned classes" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: savePlanned, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Total classes you expect this semester" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, value: editPlanned, onChange: (e) => setEditPlanned(Number(e.target.value)), required: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full", children: "Save" })
      ] })
    ] }) }),
    courses.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass-strong rounded-3xl p-12 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No courses yet. Use Add course to get started." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-5 md:grid-cols-2 xl:grid-cols-3", children: courses.map((c) => {
      const tasks = assignments.filter((a) => a.course === c.code && a.status !== "done");
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "glass-strong group relative overflow-hidden rounded-3xl p-6 hover-lift", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-25 blur-3xl", style: {
          background: c.color
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wider", style: {
              background: `color-mix(in oklab, ${c.color} 20%, transparent)`,
              color: c.color
            }, children: c.code }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
              c.credits,
              " credits"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-2 text-lg font-semibold", children: c.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: c.faculty }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Metric, { label: "Attendance", value: `${c.attendance}%`, tone: c.attendance < 75 ? "warn" : "ok" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-between rounded-xl border border-border/60 bg-secondary/30 px-3 py-2 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
              "Planned: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: c.plannedClasses }),
              " · Logged: ",
              c.totalClasses
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => {
              setEditId(c.id);
              setEditPlanned(c.plannedClasses);
            }, className: "inline-flex items-center gap-1 text-primary hover:underline", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }),
              " Edit"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Course progress" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                c.progress,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full", style: {
              width: `${c.progress}%`,
              background: `linear-gradient(90deg, ${c.color}, var(--accent))`
            } }) })
          ] }),
          c.weakTopics.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-xl border border-border/60 bg-secondary/30 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs font-medium text-[color:var(--warning)]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3.5 w-3.5" }),
              " Weak topics"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-1 space-y-1 text-xs text-muted-foreground", children: c.weakTopics.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
              "• ",
              t
            ] }, t)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 mt-4 flex items-center justify-between text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "h-3.5 w-3.5" }),
              " ",
              tasks.length,
              " upcoming"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => navigate({
              to: "/courses/$courseId",
              params: {
                courseId: c.id
              }
            }), className: "inline-flex items-center gap-1 font-medium text-primary hover:underline", children: [
              "Open ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3.5 w-3.5" })
            ] })
          ] })
        ] })
      ] }, c.id);
    }) })
  ] });
}
function Metric({
  label,
  value,
  tone
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border/60 bg-secondary/30 p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-wider text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-lg font-semibold ${tone === "warn" ? "text-[color:var(--warning)]" : ""}`, children: value })
  ] });
}
export {
  CoursesPage as component
};
