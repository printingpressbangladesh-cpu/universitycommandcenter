import { U as reactExports, L as jsxRuntimeExports } from "./server-BB9Vuddr.mjs";
import { M as useCourses, Q as useRoutine, S as useSemester, G as todayKey, y as parseDateKey, u as isWithinSemester, s as isHoliday, g as classBlocksForDate, F as toast } from "./router-CTdYHFOk.mjs";
import { B as Button } from "./button-B_NfezXh.mjs";
import { I as Input } from "./input-B3Kt6F9h.mjs";
import { L as Label } from "./label-BPM5O42P.mjs";
import { c as cn } from "./utils-CZ556u-x.mjs";
import { c as createLucideIcon } from "./createLucideIcon-CEt2Dx5A.mjs";
import { T as TriangleAlert } from "./triangle-alert-imR-iVh_.mjs";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./index-0UuDEara.mjs";
import "./clsx-DgYk2OaC.mjs";
const __iconNode$2 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M4.929 4.929 19.07 19.071", key: "196cmz" }]
];
const Ban = createLucideIcon("ban", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "m16 11 2 2 4-4", key: "9rsbq5" }],
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
];
const UserCheck = createLucideIcon("user-check", __iconNode$1);
const __iconNode = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
  ["line", { x1: "17", x2: "22", y1: "8", y2: "13", key: "3nzzx3" }],
  ["line", { x1: "22", x2: "17", y1: "8", y2: "13", key: "1swrse" }]
];
const UserX = createLucideIcon("user-x", __iconNode);
const Textarea = reactExports.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
const MIN = 70;
function AttendancePage() {
  const {
    courses
  } = useCourses();
  const {
    blocks
  } = useRoutine();
  const {
    semester,
    holidays,
    recordClassAttendance,
    cancelClass,
    getLogForSession
  } = useSemester();
  const [selectedDate, setSelectedDate] = reactExports.useState(todayKey());
  const [excuse, setExcuse] = reactExports.useState("");
  const dateObj = parseDateKey(selectedDate);
  const isToday = selectedDate === todayKey();
  const inSemester = isWithinSemester(selectedDate, semester);
  const holiday = isHoliday(selectedDate, holidays);
  const scheduled = reactExports.useMemo(() => {
    if (!inSemester || holiday) return [];
    return classBlocksForDate(blocks, dateObj).map((block) => {
      const course = courses.find((c) => c.id === block.courseId);
      if (!course) return null;
      return {
        block,
        course
      };
    }).filter(Boolean);
  }, [blocks, courses, dateObj, inSemester, holiday]);
  const mark = (courseId, routineBlockId, present) => {
    const result = recordClassAttendance({
      courseId,
      routineBlockId,
      date: selectedDate,
      present,
      excuse: isToday ? void 0 : excuse
    });
    if (!result.ok) {
      toast.error(result.error ?? "Could not save");
      return;
    }
    toast.success(present ? "Marked present" : "Marked absent");
    if (!isToday) setExcuse("");
  };
  const markCancelled = (courseId, routineBlockId) => {
    const result = cancelClass({
      courseId,
      routineBlockId,
      date: selectedDate,
      excuse: isToday ? void 0 : excuse
    });
    if (!result.ok) {
      toast.error(result.error ?? "Could not save");
      return;
    }
    toast.success("Class marked as cancelled — won't affect your attendance %");
    if (!isToday) setExcuse("");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 animate-fade-in-up", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Attendance" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Mark present/absent for scheduled classes. If the professor cancelled class, use Class cancelled." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "glass-strong rounded-3xl p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: selectedDate, onChange: (e) => setSelectedDate(e.target.value), className: "w-44" })
        ] }),
        !isToday && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-[240px] flex-1 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reason (required for past/future days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: excuse, onChange: (e) => setExcuse(e.target.value), placeholder: "e.g. Medical leave, university event…", rows: 2 })
        ] })
      ] }),
      holiday && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-[color:var(--warning)]", children: "This day is marked as a holiday — no classes scheduled." }),
      !inSemester && semester && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-[color:var(--warning)]", children: "This date is outside your semester period." })
    ] }),
    scheduled.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass-strong rounded-3xl p-10 text-center text-sm text-muted-foreground", children: holiday || !inSemester ? "No attendance to record for this date." : "No classes on your routine for this day. Add class blocks in Routine (linked to a course)." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2", children: scheduled.map(({
      block,
      course
    }) => {
      const log = getLogForSession(course.id, selectedDate, block.id);
      const cancelled = !!log?.cancelled;
      const danger = course.attendance < MIN;
      const displayName = course.name;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: `glass-strong rounded-3xl p-6 hover-lift ${cancelled ? "opacity-75" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wider", style: {
              background: `color-mix(in oklab, ${course.color} 20%, transparent)`,
              color: course.color
            }, children: course.code }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-2 text-base font-semibold", children: displayName }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              block.start,
              "–",
              block.end,
              block.location ? ` · ${block.location}` : ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
              "Logged: ",
              course.attended,
              "/",
              course.totalClasses,
              " (",
              course.attendance,
              "%) · Planned: ",
              course.plannedClasses
            ] })
          ] }),
          cancelled ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase text-muted-foreground", children: "Cancelled" }) : log ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${log.present ? "bg-[color:var(--success)]/20 text-[color:var(--success)]" : "bg-destructive/20 text-destructive"}`, children: log.present ? "Present" : "Absent" }) : null
        ] }),
        !cancelled && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", className: "flex-1 gap-1.5 border-[color:var(--success)]/40 text-[color:var(--success)] hover:bg-[color:var(--success)]/10", onClick: () => mark(course.id, block.id, true), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "h-4 w-4" }),
              " Present"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", className: "flex-1 gap-1.5", onClick: () => mark(course.id, block.id, false), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(UserX, { className: "h-4 w-4" }),
              " Absent"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "ghost", className: "mt-2 w-full gap-1.5 text-xs text-muted-foreground", onClick: () => markCancelled(course.id, block.id), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "h-3.5 w-3.5" }),
            " Class cancelled by professor"
          ] })
        ] }),
        log?.excuse && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-xs text-muted-foreground", children: [
          "Note: ",
          log.excuse
        ] }),
        danger && !cancelled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 shrink-0" }),
          " Below ",
          MIN,
          "% overall"
        ] })
      ] }, `${block.id}-${selectedDate}`);
    }) }),
    courses.length > 0 && scheduled.length === 0 && isToday && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "glass-strong rounded-3xl p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-muted-foreground", children: "Course overview" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: courses.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border/60 bg-secondary/30 p-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: c.code }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          c.attendance,
          "% · ",
          c.attended,
          "/",
          c.totalClasses,
          " logged · ",
          c.plannedClasses,
          " planned"
        ] })
      ] }, c.id)) })
    ] })
  ] });
}
export {
  AttendancePage as component
};
