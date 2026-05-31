import { U as reactExports, L as jsxRuntimeExports } from "./server-BB9Vuddr.mjs";
import { M as useCourses, I as useAssignments, F as toast } from "./router-CTdYHFOk.mjs";
import { C as CourseSelect } from "./CourseSelect-BhgjpK3F.mjs";
import { B as Button } from "./button-B_NfezXh.mjs";
import { I as Input } from "./input-B3Kt6F9h.mjs";
import { L as Label } from "./label-BPM5O42P.mjs";
import { D as Dialog, d as DialogTrigger, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-BmgT1gFM.mjs";
import { S as Search } from "./search-CF2g7OSZ.mjs";
import { P as Plus } from "./plus-BYQi9liU.mjs";
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
import "./createLucideIcon-CEt2Dx5A.mjs";
import "./check-CvBesx_l.mjs";
import "./index-0UuDEara.mjs";
import "./index-B1Mostm-.mjs";
import "./x-hdVcQCsH.mjs";
const columns = [{
  id: "todo",
  title: "To do",
  tone: "var(--blue)"
}, {
  id: "in_progress",
  title: "In progress",
  tone: "var(--purple)"
}, {
  id: "done",
  title: "Completed",
  tone: "var(--success)"
}];
function AssignmentsPage() {
  const {
    courses
  } = useCourses();
  const {
    assignments: items,
    setAssignments: setItems,
    addAssignment
  } = useAssignments();
  const [q, setQ] = reactExports.useState("");
  const [subject, setSubject] = reactExports.useState("all");
  const [dragId, setDragId] = reactExports.useState(null);
  const [open, setOpen] = reactExports.useState(false);
  const [title, setTitle] = reactExports.useState("");
  const [course, setCourse] = reactExports.useState("none");
  const [due, setDue] = reactExports.useState("");
  const [priority, setPriority] = reactExports.useState("medium");
  const filtered = reactExports.useMemo(() => {
    return items.filter((a) => (subject === "all" || a.course === subject) && (a.title.toLowerCase().includes(q.toLowerCase()) || a.course.toLowerCase().includes(q.toLowerCase())));
  }, [items, q, subject]);
  const onDrop = (col) => {
    if (!dragId) return;
    setItems((prev) => prev.map((x) => x.id === dragId ? {
      ...x,
      status: col,
      progress: col === "done" ? 100 : x.progress
    } : x));
    setDragId(null);
  };
  const handleCreate = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Enter a title");
      return;
    }
    if (course === "none") {
      toast.error("Select a course");
      return;
    }
    if (!due) {
      toast.error("Pick a due date");
      return;
    }
    addAssignment({
      title: title.trim(),
      course,
      due: (/* @__PURE__ */ new Date(due + "T23:59:59")).toISOString(),
      priority,
      status: "todo",
      progress: 0
    });
    setTitle("");
    setCourse("none");
    setDue("");
    setPriority("medium");
    setOpen(false);
    toast.success("Assignment created");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 animate-fade-in-up", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Assignments" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Drag cards across columns to update status" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Search…", className: "h-10 w-56 rounded-xl border border-border/60 bg-secondary/40 pl-9 pr-3 text-sm outline-none focus:border-ring" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CourseSelect, { value: subject, onValueChange: setSubject, triggerClassName: "w-40", options: [{
          value: "all",
          label: "All subjects"
        }, ...courses.map((c) => ({
          value: c.code,
          label: c.code
        }))] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: setOpen, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "bg-gradient-primary text-primary-foreground shadow-glow", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
            " New"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "glass-strong max-w-md rounded-3xl border-border/60", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "New assignment" }) }),
            courses.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Add a course first, then create assignments." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleCreate, className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Title" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: title, onChange: (e) => setTitle(e.target.value), placeholder: "Lab report 2", required: true })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Course" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(CourseSelect, { value: course, onValueChange: setCourse, options: [{
                  value: "none",
                  label: "Select course"
                }, ...courses.map((c) => ({
                  value: c.code,
                  label: c.code
                }))] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Due date" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: due, onChange: (e) => setDue(e.target.value), required: true })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Priority" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CourseSelect, { value: priority, onValueChange: (v) => setPriority(v), options: [{
                    value: "low",
                    label: "Low"
                  }, {
                    value: "medium",
                    label: "Medium"
                  }, {
                    value: "high",
                    label: "High"
                  }] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full bg-gradient-primary text-primary-foreground", children: "Create assignment" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-3", children: columns.map((col) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onDragOver: (e) => e.preventDefault(), onDrop: () => onDrop(col.id), className: "glass-strong flex min-h-[60vh] flex-col rounded-3xl p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between px-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full", style: {
            background: col.tone
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: col.title })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-secondary/60 px-2 py-0.5 text-[11px] text-muted-foreground", children: filtered.filter((a) => a.status === col.id).length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 space-y-2 overflow-y-auto pr-1", children: filtered.filter((a) => a.status === col.id).map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { draggable: true, onDragStart: () => setDragId(a.id), className: "cursor-grab rounded-2xl border border-border/60 bg-card/60 p-3 backdrop-blur-md transition active:cursor-grabbing hover-lift", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-md bg-secondary px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground", children: a.course }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium ${a.priority === "high" ? "bg-destructive/20 text-destructive" : a.priority === "medium" ? "bg-[color:var(--warning)]/20 text-[color:var(--warning)]" : "bg-[color:var(--success)]/20 text-[color:var(--success)]"}`, children: a.priority })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mt-2 text-sm font-medium leading-snug", children: a.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 h-1.5 overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-gradient-primary", style: {
          width: `${a.progress}%`
        } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center justify-between text-[11px] text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Due ",
            new Date(a.due).toLocaleDateString(void 0, {
              month: "short",
              day: "numeric"
            })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            a.progress,
            "%"
          ] })
        ] })
      ] }, a.id)) })
    ] }, col.id)) })
  ] });
}
export {
  AssignmentsPage as component
};
