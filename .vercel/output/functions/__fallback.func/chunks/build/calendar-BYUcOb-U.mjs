import { U as reactExports, L as jsxRuntimeExports } from "./server-BB9Vuddr.mjs";
import { I as useAssignments, Q as useRoutine, S as useSemester, M as useCourses, N as useExams, m as expandRoutineDates, y as parseDateKey, i as dateKey } from "./router-CTdYHFOk.mjs";
import { c as createLucideIcon } from "./createLucideIcon-CEt2Dx5A.mjs";
import { C as ChevronRight } from "./chevron-right-B7tSAgOS.mjs";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "util";
import "crypto";
import "async_hooks";
import "stream";
const __iconNode = [["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]];
const ChevronLeft = createLucideIcon("chevron-left", __iconNode);
function CalendarPage() {
  const {
    assignments
  } = useAssignments();
  const {
    blocks
  } = useRoutine();
  const {
    semester,
    holidays
  } = useSemester();
  const {
    courses
  } = useCourses();
  const {
    exams
  } = useExams();
  const [cursor, setCursor] = reactExports.useState(() => {
    const d = /* @__PURE__ */ new Date();
    d.setDate(1);
    return d;
  });
  const monthStart = reactExports.useMemo(() => new Date(cursor.getFullYear(), cursor.getMonth(), 1), [cursor]);
  const monthEnd = reactExports.useMemo(() => new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0), [cursor]);
  const events = reactExports.useMemo(() => {
    const list = [];
    for (const {
      date,
      block
    } of expandRoutineDates(blocks, semester, holidays, monthStart, monthEnd)) {
      const c = courses.find((x) => x.id === block.courseId);
      list.push({
        id: `r-${block.id}-${date}`,
        date: parseDateKey(date),
        title: block.title,
        subtitle: c ? c.code : block.start,
        color: c?.color ?? "var(--cyan)",
        kind: block.isClass !== false && block.courseId ? "class" : "other"
      });
    }
    for (const a of assignments) {
      if (a.status === "done") continue;
      const d = new Date(a.due);
      if (d >= monthStart && d <= monthEnd) {
        courses.find((x) => x.code === a.course);
        list.push({
          id: `a-${a.id}`,
          date: d,
          title: a.title,
          subtitle: `Due · ${a.course}`,
          color: a.priority === "high" ? "var(--destructive)" : a.priority === "medium" ? "var(--warning)" : "var(--success)",
          kind: "assignment"
        });
      }
    }
    for (const ex of exams) {
      const c = courses.find((x) => x.id === ex.courseId);
      const d = parseDateKey(ex.date);
      if (d >= monthStart && d <= monthEnd) {
        list.push({
          id: `e-${ex.id}`,
          date: d,
          title: ex.title,
          subtitle: c ? `${c.code}${ex.status === "done" ? " · done" : ""}` : ex.status,
          color: "var(--purple)",
          kind: "exam"
        });
      }
    }
    for (const h of holidays) {
      const start = parseDateKey(h.startDate);
      const end = parseDateKey(h.endDate ?? h.startDate);
      const cur = new Date(start);
      while (cur <= end) {
        if (cur >= monthStart && cur <= monthEnd) {
          list.push({
            id: `h-${h.id}-${dateKey(cur)}`,
            date: new Date(cur),
            title: h.label,
            subtitle: "Holiday",
            color: "var(--muted-foreground)",
            kind: "holiday"
          });
        }
        cur.setDate(cur.getDate() + 1);
      }
    }
    return list;
  }, [blocks, semester, holidays, assignments, courses, exams, monthStart, monthEnd]);
  const grid = reactExports.useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const startDow = first.getDay();
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startDow; i++) cells.push({
      date: null
    });
    for (let d = 1; d <= daysInMonth; d++) cells.push({
      date: new Date(cursor.getFullYear(), cursor.getMonth(), d)
    });
    while (cells.length % 7 !== 0) cells.push({
      date: null
    });
    return cells;
  }, [cursor]);
  const monthLabel = cursor.toLocaleString(void 0, {
    month: "long",
    year: "numeric"
  });
  const today = /* @__PURE__ */ new Date();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 animate-fade-in-up", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-end justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Calendar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Routine classes, assignment deadlines, exams & holidays — updated from your routine." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1)), className: "grid h-9 w-9 place-items-center rounded-xl border border-border/60 hover:bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-44 text-center text-base font-semibold", children: monthLabel }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)), className: "grid h-9 w-9 place-items-center rounded-xl border border-border/60 hover:bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-[var(--cyan)]" }),
        " Class"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-[var(--warning)]" }),
        " Deadline"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-[var(--purple)]" }),
        " Exam"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-muted-foreground" }),
        " Holiday"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong overflow-hidden rounded-3xl p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 border-b border-border/60 pb-2 text-center text-xs uppercase tracking-wider text-muted-foreground", children: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: d }, d)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 grid grid-cols-7 gap-1", children: grid.map((cell, i) => {
        if (!cell.date) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-[88px] rounded-xl bg-transparent" }, i);
        const isToday = cell.date.toDateString() === today.toDateString();
        const key = dateKey(cell.date);
        const cellEvents = events.filter((e) => dateKey(e.date) === key);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `min-h-[88px] rounded-xl border p-1.5 text-left text-xs transition ${isToday ? "border-primary bg-primary/10" : "border-border/60 bg-secondary/20 hover:bg-secondary/40"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-xs font-medium ${isToday ? "text-primary" : ""}`, children: cell.date.getDate() }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 space-y-0.5", children: [
            cellEvents.slice(0, 3).map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate rounded px-1 py-0.5 text-[10px]", style: {
              background: `color-mix(in oklab, ${e.color} 25%, transparent)`,
              color: e.color
            }, title: e.title, children: e.subtitle ? `${e.subtitle}` : e.title }, e.id)),
            cellEvents.length > 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
              "+",
              cellEvents.length - 3,
              " more"
            ] })
          ] })
        ] }, i);
      }) })
    ] })
  ] });
}
export {
  CalendarPage as component
};
