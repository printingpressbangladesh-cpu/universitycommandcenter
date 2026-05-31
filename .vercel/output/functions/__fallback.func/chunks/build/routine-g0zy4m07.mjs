import { U as reactExports, L as jsxRuntimeExports } from "./server-BB9Vuddr.mjs";
import { J as useAuth, M as useCourses, Q as useRoutine, S as useSemester, R as ROUTINE_DAYS, F as toast } from "./router-CTdYHFOk.mjs";
import { B as Button } from "./button-B_NfezXh.mjs";
import { I as Input } from "./input-B3Kt6F9h.mjs";
import { L as Label } from "./label-BPM5O42P.mjs";
import { C as CourseSelect } from "./CourseSelect-BhgjpK3F.mjs";
import { c as createLucideIcon } from "./createLucideIcon-CEt2Dx5A.mjs";
import { P as Plus } from "./plus-BYQi9liU.mjs";
import { T as Trash2 } from "./trash-2-rIKLTn3v.mjs";
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
import "./select-DHN0rxF_.mjs";
import "./index-BcqomYnJ.mjs";
import "./check-CvBesx_l.mjs";
const __iconNode = [
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["path", { d: "M3 10h18", key: "8toen8" }],
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M17 14h-6", key: "bkmgh3" }],
  ["path", { d: "M13 18H7", key: "bb0bb7" }],
  ["path", { d: "M7 14h.01", key: "1qa3f1" }],
  ["path", { d: "M17 18h.01", key: "1bdyru" }]
];
const CalendarRange = createLucideIcon("calendar-range", __iconNode);
function RoutinePage() {
  const {
    user
  } = useAuth();
  const {
    courses
  } = useCourses();
  const {
    blocks,
    days,
    addBlock,
    removeBlock
  } = useRoutine();
  const {
    semester,
    holidays,
    setSemester,
    addHoliday,
    removeHoliday,
    saveNotificationPrefs,
    syncToGoogle,
    prefs
  } = useSemester();
  const [day, setDay] = reactExports.useState("Mon");
  const [start, setStart] = reactExports.useState("09:00");
  const [end, setEnd] = reactExports.useState("10:00");
  const [location, setLocation] = reactExports.useState("");
  const [courseId, setCourseId] = reactExports.useState("none");
  const [holLabel, setHolLabel] = reactExports.useState("");
  const [holStart, setHolStart] = reactExports.useState("");
  const [holEnd, setHolEnd] = reactExports.useState("");
  const [holType, setHolType] = reactExports.useState("single");
  const handleAdd = (e) => {
    e.preventDefault();
    if (courseId === "none") {
      toast.error("Select a course for this class");
      return;
    }
    const c = courses.find((x) => x.id === courseId);
    if (!c) return;
    addBlock({
      day,
      start,
      end,
      title: c.name,
      location: location.trim() || void 0,
      courseId,
      courseCode: c.code,
      isClass: true
    });
    setLocation("");
    toast.success("Added to routine — calendar updates automatically");
    if (prefs?.enabled) {
      void syncToGoogle().catch(() => {
      });
    }
  };
  const handleHoliday = (e) => {
    e.preventDefault();
    if (!holLabel.trim() || !holStart) return;
    if (holType === "range" && holEnd && holEnd < holStart) {
      toast.error("End date must be on or after start date");
      return;
    }
    addHoliday({
      label: holLabel.trim(),
      startDate: holStart,
      endDate: holType === "range" ? holEnd || holStart : holStart,
      type: holType
    });
    setHolLabel("");
    setHolStart("");
    setHolEnd("");
    toast.success("Holiday saved");
  };
  const handleSync = async () => {
    try {
      if (user?.email) await saveNotificationPrefs({
        email: user.email
      });
      await syncToGoogle();
      toast.success("Synced — daily emails will include your routine & deadlines");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sync failed");
    }
  };
  const blockLabel = (b) => {
    const c = courses.find((x) => x.id === b.courseId);
    return c ? `${c.code} — ${c.name}` : b.title;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 animate-fade-in-up", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-end justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Routine Maker" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Classes sync to Calendar & Attendance. Default semester length is 3 months." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", onClick: () => void handleSync(), className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarRange, { className: "h-4 w-4" }),
        " Sync email reminders"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "glass-strong rounded-3xl p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Semester period" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Routine & attendance only apply within these dates." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid gap-4 sm:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Start date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: semester?.startDate ?? "", onChange: (e) => setSemester({
            startDate: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "End date (3-month semester)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: semester?.endDate ?? "", onChange: (e) => setSemester({
            endDate: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Label" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: semester?.label ?? "", onChange: (e) => setSemester({
            label: e.target.value
          }), placeholder: "Spring 2026" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "glass-strong rounded-3xl p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Holidays" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Single day or date range — no classes on these days." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleHoliday, className: "mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 sm:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: holLabel, onChange: (e) => setHolLabel(e.target.value), placeholder: "Eid vacation", required: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CourseSelect, { value: holType, onValueChange: (v) => setHolType(v), options: [{
            value: "single",
            label: "Single day"
          }, {
            value: "range",
            label: "Date range"
          }] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Start" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: holStart, onChange: (e) => setHolStart(e.target.value), required: true })
        ] }),
        holType === "range" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "End" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: holEnd, onChange: (e) => setHolEnd(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", variant: "secondary", className: "w-full", children: "Add holiday" }) })
      ] }),
      holidays.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-4 flex flex-wrap gap-2", children: holidays.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 rounded-full border border-border/60 bg-secondary/40 px-3 py-1 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          h.label,
          ": ",
          h.startDate,
          h.type === "range" && h.endDate && h.endDate !== h.startDate ? ` → ${h.endDate}` : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => removeHoliday(h.id), className: "text-muted-foreground hover:text-destructive", children: "×" })
      ] }, h.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "glass-strong rounded-3xl p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Add weekly class" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Pick the course — name comes from your course list." }),
      courses.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: "Add courses first, then build your weekly routine." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleAdd, className: "mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Day" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CourseSelect, { value: day, onValueChange: (v) => setDay(v), options: ROUTINE_DAYS.map((d) => ({
            value: d,
            label: d
          })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Start" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", value: start, onChange: (e) => setStart(e.target.value), required: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "End" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", value: end, onChange: (e) => setEnd(e.target.value), required: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Course" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CourseSelect, { value: courseId, onValueChange: setCourseId, options: [{
            value: "none",
            label: "Select course"
          }, ...courses.map((c) => ({
            value: c.id,
            label: `${c.code} — ${c.name}`
          }))] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Location (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: location, onChange: (e) => setLocation(e.target.value), placeholder: "Room 404" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end sm:col-span-2 lg:col-span-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", className: "bg-gradient-primary text-primary-foreground shadow-glow", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
          " Add to routine"
        ] }) })
      ] }),
      !prefs?.enabled && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs text-muted-foreground", children: "Enable email reminders in Settings and sync to get one email with tomorrow's classes and deadline alerts." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-4", children: days.map((d) => {
      const dayBlocks = blocks.filter((b) => b.day === d);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "glass-strong rounded-3xl p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold uppercase tracking-wider text-muted-foreground", children: d }),
        dayBlocks.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs text-muted-foreground", children: "No blocks yet" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 space-y-2", children: dayBlocks.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "group rounded-xl border border-border/60 bg-secondary/30 p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-[color:var(--cyan)]", children: [
              b.start,
              " – ",
              b.end
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: blockLabel(b) }),
            b.location && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: b.location })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => removeBlock(b.id), className: "rounded-lg p-1 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive", "aria-label": "Remove", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
        ] }) }, b.id)) })
      ] }, d);
    }) })
  ] });
}
export {
  RoutinePage as component
};
