import { U as reactExports, L as jsxRuntimeExports } from "./server-BB9Vuddr.mjs";
import { M as useCourses, P as useNotes } from "./router-CTdYHFOk.mjs";
import { C as CourseSelect } from "./CourseSelect-BhgjpK3F.mjs";
import { P as Plus } from "./plus-BYQi9liU.mjs";
import { S as Search } from "./search-CF2g7OSZ.mjs";
import { c as createLucideIcon } from "./createLucideIcon-CEt2Dx5A.mjs";
import { T as Trash2 } from "./trash-2-rIKLTn3v.mjs";
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
const __iconNode = [
  ["path", { d: "M12 17v5", key: "bb1du9" }],
  [
    "path",
    {
      d: "M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z",
      key: "1nkz8b"
    }
  ]
];
const Pin = createLucideIcon("pin", __iconNode);
function NotesPage() {
  const {
    courses
  } = useCourses();
  const {
    notes,
    setNotes
  } = useNotes();
  const [selectedId, setSelectedId] = reactExports.useState("");
  const [q, setQ] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (!selectedId && notes[0]) setSelectedId(notes[0].id);
  }, [notes, selectedId]);
  const filtered = reactExports.useMemo(() => {
    const sorted = [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned) || +new Date(b.updatedAt) - +new Date(a.updatedAt));
    if (!q) return sorted;
    const ql = q.toLowerCase();
    return sorted.filter((n) => n.title.toLowerCase().includes(ql) || n.body.toLowerCase().includes(ql) || n.tags.some((t) => t.includes(ql)));
  }, [notes, q]);
  const selected = notes.find((n) => n.id === selectedId) ?? filtered[0];
  const update = (patch) => {
    if (!selected) return;
    setNotes((p) => p.map((n) => n.id === selected.id ? {
      ...n,
      ...patch,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    } : n));
  };
  const create = () => {
    const n = {
      id: crypto.randomUUID(),
      title: "Untitled",
      body: "",
      tags: [],
      pinned: false,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    setNotes((p) => [n, ...p]);
    setSelectedId(n.id);
  };
  const remove = (id) => {
    setNotes((p) => p.filter((n) => n.id !== id));
    if (selectedId === id) setSelectedId(filtered.find((n) => n.id !== id)?.id ?? "");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 animate-fade-in-up", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-end justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Organize lecture notes, formulas and exam summaries" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: create, className: "inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " New note"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 lg:grid-cols-[320px_1fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "glass-strong rounded-3xl p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Search notes", className: "h-10 w-full rounded-xl border border-border/60 bg-secondary/40 pl-9 pr-3 text-sm outline-none focus:border-ring" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 max-h-[60vh] space-y-1 overflow-y-auto", children: filtered.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSelectedId(n.id), className: `group flex w-full items-start gap-2 rounded-2xl p-3 text-left transition ${selected?.id === n.id ? "bg-secondary/70" : "hover:bg-secondary/40"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-sm font-medium", children: [
            n.pinned && /* @__PURE__ */ jsxRuntimeExports.jsx(Pin, { className: "h-3 w-3 text-[color:var(--cyan)]" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: n.title })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 line-clamp-2 text-xs text-muted-foreground", children: n.body || "No content yet…" }),
          n.course && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 inline-block rounded-md bg-secondary px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground", children: n.course })
        ] }) }) }, n.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "glass-strong rounded-3xl p-6", children: selected ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: selected.title, onChange: (e) => update({
            title: e.target.value
          }), className: "flex-1 border-0 bg-transparent text-2xl font-semibold outline-none placeholder:text-muted-foreground", placeholder: "Note title" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => update({
            pinned: !selected.pinned
          }), className: `rounded-lg p-2 transition ${selected.pinned ? "bg-[color:var(--cyan)]/15 text-[color:var(--cyan)]" : "text-muted-foreground hover:bg-secondary"}`, "aria-label": "Pin", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pin, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => remove(selected.id), className: "rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive", "aria-label": "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-2 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CourseSelect, { value: selected.course ?? "none", onValueChange: (v) => update({
            course: v === "none" ? void 0 : v
          }), triggerClassName: "h-8 w-36 text-xs", options: [{
            value: "none",
            label: "No course"
          }, ...courses.map((c) => ({
            value: c.code,
            label: c.code
          }))] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { defaultValue: selected.tags.join(", "), onBlur: (e) => update({
            tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
          }), placeholder: "tags, comma separated", className: "flex-1 rounded-lg border border-border/60 bg-secondary/40 px-2 py-1 text-xs outline-none" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
            "Updated ",
            new Date(selected.updatedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: selected.body, onChange: (e) => update({
          body: e.target.value
        }), placeholder: "Write in markdown… # heading, **bold**, - bullets", className: "mt-4 h-[55vh] w-full resize-none rounded-2xl border border-border/60 bg-secondary/20 p-4 font-mono text-sm leading-relaxed outline-none focus:border-ring" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-[60vh] place-items-center text-muted-foreground", children: "No notes yet — create your first one." }) })
    ] })
  ] });
}
export {
  NotesPage as component
};
