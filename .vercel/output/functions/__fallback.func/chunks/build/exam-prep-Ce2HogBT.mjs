import { U as reactExports, L as jsxRuntimeExports } from "./server-BB9Vuddr.mjs";
import { J as useAuth, M as useCourses, N as useExams, v as listExamChecklist, t as isPastDate, j as daysUntilDate, H as upsertChecklistItem, l as deleteChecklistItem } from "./router-CTdYHFOk.mjs";
import { I as Input } from "./input-B3Kt6F9h.mjs";
import { B as Button } from "./button-B_NfezXh.mjs";
import { L as ListChecks } from "./list-checks-4erwzW-h.mjs";
import { P as Plus } from "./plus-BYQi9liU.mjs";
import { C as Check } from "./check-CvBesx_l.mjs";
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
import "./createLucideIcon-CEt2Dx5A.mjs";
function ExamPrepPage() {
  const {
    user
  } = useAuth();
  const userId = user?.id ?? null;
  const {
    courses
  } = useCourses();
  const {
    exams
  } = useExams();
  const [items, setItems] = reactExports.useState([]);
  const [taskDraft, setTaskDraft] = reactExports.useState({});
  const loadChecklist = reactExports.useCallback(async () => {
    if (!userId) return;
    const rows = await listExamChecklist(userId);
    setItems(rows);
  }, [userId]);
  reactExports.useEffect(() => {
    void loadChecklist();
  }, [loadChecklist]);
  const upcomingExams = reactExports.useMemo(() => exams.filter((e) => e.status === "upcoming" && !isPastDate(e.date)), [exams]);
  const nearestExam = reactExports.useMemo(() => {
    if (upcomingExams.length === 0) return null;
    return [...upcomingExams].sort((a, b) => a.date.localeCompare(b.date))[0];
  }, [upcomingExams]);
  const overall = reactExports.useMemo(() => {
    if (items.length === 0) return 0;
    return Math.round(items.filter((i) => i.done).length / items.length * 100);
  }, [items]);
  const toggleChecklist = async (item) => {
    const next = {
      ...item,
      done: !item.done
    };
    setItems((p) => p.map((x) => x.id === item.id ? next : x));
    if (userId) await upsertChecklistItem(userId, next);
  };
  const addChecklistItem = async (cid) => {
    const text = (taskDraft[cid] ?? "").trim();
    if (!text || !userId) return;
    const item = {
      id: crypto.randomUUID(),
      courseId: cid,
      userId,
      text,
      done: false
    };
    setItems((p) => [...p, item]);
    setTaskDraft((p) => ({
      ...p,
      [cid]: ""
    }));
    if (userId) await upsertChecklistItem(userId, item);
  };
  const removeItem = async (id) => {
    setItems((p) => p.filter((x) => x.id !== id));
    await deleteChecklistItem(id);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 animate-fade-in-up", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "glass-strong relative overflow-hidden rounded-3xl p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-12 -top-12 h-44 w-44 rounded-full bg-gradient-primary opacity-30 blur-3xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-wrap items-end justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Exam Prep" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Revision checklists and readiness — add exams and marks on the Exams page." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-6", children: [
          nearestExam && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-wider text-muted-foreground", children: "Next exam" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-semibold text-gradient", children: [
              daysUntilDate(nearestExam.date),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base text-muted-foreground", children: "days" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: nearestExam.title })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-wider text-muted-foreground", children: "Readiness" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-semibold", children: items.length ? `${overall}%` : "—" }),
            items.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 h-2 w-32 overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-gradient-primary", style: {
              width: `${overall}%`
            } }) })
          ] })
        ] })
      ] })
    ] }),
    courses.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass-strong rounded-3xl p-12 text-center text-sm text-muted-foreground", children: "Add courses first, then build revision lists per subject." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-5 md:grid-cols-2 xl:grid-cols-3", children: courses.map((c) => {
      const courseItems = items.filter((i) => i.courseId === c.id);
      const checked = courseItems.filter((i) => i.done).length;
      const nextExam = upcomingExams.find((e) => e.courseId === c.id);
      const courseDays = nextExam ? daysUntilDate(nextExam.date) : null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "glass-strong rounded-3xl p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wider", style: {
            background: `color-mix(in oklab, ${c.color} 20%, transparent)`,
            color: c.color
          }, children: c.code }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListChecks, { className: "h-5 w-5 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-2 text-base font-semibold", children: c.name }),
        courseDays !== null && nextExam && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-[color:var(--cyan)]", children: [
          nextExam.title,
          ": ",
          courseDays,
          " day",
          courseDays === 1 ? "" : "s",
          " left"
        ] }),
        courseItems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Revision" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              checked,
              "/",
              courseItems.length
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 h-1.5 overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full", style: {
            width: `${checked / courseItems.length * 100}%`,
            background: c.color
          } }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "mt-4 flex gap-2", onSubmit: (ev) => {
          ev.preventDefault();
          void addChecklistItem(c.id);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: taskDraft[c.id] ?? "", onChange: (e) => setTaskDraft((p) => ({
            ...p,
            [c.id]: e.target.value
          })), placeholder: "Add revision task…", className: "h-9 flex-1 text-sm" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", size: "sm", variant: "secondary", className: "h-9 px-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 space-y-2", children: courseItems.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-xs text-muted-foreground", children: "No tasks yet." }) : courseItems.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => void toggleChecklist(it), className: "shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `grid h-5 w-5 place-items-center rounded-md border ${it.done ? "border-transparent bg-gradient-primary" : "border-border bg-transparent"}`, children: it.done && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3 text-primary-foreground" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `flex-1 text-sm ${it.done ? "line-through text-muted-foreground" : ""}`, children: it.text }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => void removeItem(it.id), className: "rounded-lg p-1 text-muted-foreground hover:text-destructive", "aria-label": "Remove task", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
        ] }, it.id)) }),
        c.weakTopics.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-xl border border-[color:var(--warning)]/30 bg-[color:var(--warning)]/5 p-3 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-[color:var(--warning)]", children: "Focus on weak topics" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-1 space-y-0.5 text-muted-foreground", children: c.weakTopics.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            "• ",
            t
          ] }, t)) })
        ] })
      ] }, c.id);
    }) })
  ] });
}
export {
  ExamPrepPage as component
};
