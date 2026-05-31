import { U as reactExports, L as jsxRuntimeExports, O as Outlet, a6 as useRouter } from "./server-BB9Vuddr.mjs";
import { J as useAuth, O as useNavigate, V as useTheme, L as Link } from "./router-CTdYHFOk.mjs";
import { B as Button } from "./button-B_NfezXh.mjs";
import { c as cn } from "./utils-CZ556u-x.mjs";
import { X } from "./x-hdVcQCsH.mjs";
import { c as createLucideIcon } from "./createLucideIcon-CEt2Dx5A.mjs";
import { S as Search } from "./search-CF2g7OSZ.mjs";
import { S as Sun, M as Moon, L as LogOut } from "./sun-AX_p2AM5.mjs";
import { G as GraduationCap } from "./graduation-cap-CUuo92-b.mjs";
import { S as Shield } from "./shield-BzuPlltJ.mjs";
import { B as BookOpen } from "./book-open-49nqEHGe.mjs";
import { C as ClipboardList } from "./clipboard-list-mEJa_sXH.mjs";
import { C as CalendarCheck2, T as Timer } from "./timer-C2rDgvF9.mjs";
import { L as ListChecks } from "./list-checks-4erwzW-h.mjs";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./index-0UuDEara.mjs";
import "./clsx-DgYk2OaC.mjs";
function useRouterState(opts) {
  const contextRouter = useRouter({ warn: opts?.router === void 0 });
  const router = opts?.router || contextRouter;
  {
    const state = router.stores.__store.get();
    return opts?.select ? opts.select(state) : state;
  }
}
const __iconNode$5 = [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }],
  ["path", { d: "M8 14h.01", key: "6423bh" }],
  ["path", { d: "M12 14h.01", key: "1etili" }],
  ["path", { d: "M16 14h.01", key: "1gbofw" }],
  ["path", { d: "M8 18h.01", key: "lrp35t" }],
  ["path", { d: "M12 18h.01", key: "mhygvu" }],
  ["path", { d: "M16 18h.01", key: "kzsmim" }]
];
const CalendarDays = createLucideIcon("calendar-days", __iconNode$5);
const __iconNode$4 = [
  ["rect", { width: "7", height: "9", x: "3", y: "3", rx: "1", key: "10lvy0" }],
  ["rect", { width: "7", height: "5", x: "14", y: "3", rx: "1", key: "16une8" }],
  ["rect", { width: "7", height: "9", x: "14", y: "12", rx: "1", key: "1hutg5" }],
  ["rect", { width: "7", height: "5", x: "3", y: "16", rx: "1", key: "ldoo1y" }]
];
const LayoutDashboard = createLucideIcon("layout-dashboard", __iconNode$4);
const __iconNode$3 = [
  ["path", { d: "M13 5h8", key: "a7qcls" }],
  ["path", { d: "M13 12h8", key: "h98zly" }],
  ["path", { d: "M13 19h8", key: "c3s6r1" }],
  ["path", { d: "m3 17 2 2 4-4", key: "1jhpwq" }],
  ["rect", { x: "3", y: "4", width: "6", height: "6", rx: "1", key: "cif1o7" }]
];
const ListTodo = createLucideIcon("list-todo", __iconNode$3);
const __iconNode$2 = [
  ["path", { d: "M4 5h16", key: "1tepv9" }],
  ["path", { d: "M4 12h16", key: "1lakjw" }],
  ["path", { d: "M4 19h16", key: "1djgab" }]
];
const Menu = createLucideIcon("menu", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4", key: "re6nr2" }],
  ["path", { d: "M2 6h4", key: "aawbzj" }],
  ["path", { d: "M2 10h4", key: "l0bgd4" }],
  ["path", { d: "M2 14h4", key: "1gsvsf" }],
  ["path", { d: "M2 18h4", key: "1bu2t1" }],
  [
    "path",
    {
      d: "M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z",
      key: "pqwjuv"
    }
  ]
];
const NotebookPen = createLucideIcon("notebook-pen", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
      key: "1i5ecw"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
const Settings = createLucideIcon("settings", __iconNode);
const nav = [{
  to: "/dashboard",
  label: "Dashboard",
  icon: LayoutDashboard
}, {
  to: "/courses",
  label: "Courses",
  icon: BookOpen
}, {
  to: "/assignments",
  label: "Assignments",
  icon: ClipboardList
}, {
  to: "/attendance",
  label: "Attendance",
  icon: CalendarCheck2
}, {
  to: "/study",
  label: "Study Planner",
  icon: Timer
}, {
  to: "/routine",
  label: "Routine",
  icon: ListTodo
}, {
  to: "/exams",
  label: "Exams",
  icon: GraduationCap
}, {
  to: "/exam-prep",
  label: "Exam Prep",
  icon: ListChecks
}, {
  to: "/notes",
  label: "Notes",
  icon: NotebookPen
}, {
  to: "/calendar",
  label: "Calendar",
  icon: CalendarDays
}, {
  to: "/settings",
  label: "Settings",
  icon: Settings
}];
function AppLayout() {
  const {
    session,
    loading,
    signOut,
    user,
    isAdmin
  } = useAuth();
  const navigate = useNavigate();
  const {
    theme,
    toggle
  } = useTheme();
  const path = useRouterState({
    select: (s) => s.location.pathname
  });
  const [open, setOpen] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!loading && !session) navigate({
      to: "/login"
    });
  }, [session, loading, navigate]);
  reactExports.useEffect(() => {
    setOpen(false);
  }, [path]);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 animate-pulse rounded-full bg-gradient-primary shadow-glow" }) });
  }
  if (!session) return null;
  const fullName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-screen w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "sticky top-0 hidden h-screen w-64 shrink-0 border-r border-sidebar-border bg-sidebar/80 p-4 backdrop-blur-xl md:flex md:flex-col", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarInner, { path, fullName, email: user?.email ?? "", isAdmin, onSignOut: () => signOut().then(() => navigate({
      to: "/login"
    })) }) }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-50 md:hidden", onClick: () => setOpen(false), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/50 backdrop-blur-sm" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "absolute left-0 top-0 h-full w-72 border-r border-sidebar-border bg-sidebar p-4 backdrop-blur-xl animate-fade-in-up", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarInner, { path, fullName, email: user?.email ?? "", isAdmin, onSignOut: () => signOut().then(() => navigate({
        to: "/login"
      })) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-1 flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/60 px-4 backdrop-blur-xl md:px-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "md:hidden", onClick: () => setOpen((o) => !o), children: open ? /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative hidden flex-1 max-w-md md:block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { placeholder: "Quick search… courses, notes, assignments", className: "h-10 w-full rounded-xl border border-border/60 bg-secondary/40 pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-ring" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 items-center justify-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: toggle, "aria-label": "Toggle theme", children: theme === "dark" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "h-5 w-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden h-9 w-9 place-items-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-glow sm:grid", children: fullName.charAt(0).toUpperCase() })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) })
    ] })
  ] });
}
function SidebarInner({
  path,
  fullName,
  email,
  isAdmin,
  onSignOut
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/dashboard", className: "mb-6 flex items-center gap-2.5 px-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GraduationCap, { className: "h-5 w-5 text-primary-foreground" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "leading-tight", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: "University Command" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: "Center" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex-1 space-y-1", children: [
      isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/admin", className: cn("group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all", path === "/admin" ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4.5 w-4.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Admin" })
      ] }),
      nav.map(({
        to,
        label,
        icon: Icon
      }) => {
        const active = path === to || path.startsWith(to + "/");
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to, className: cn("group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all", active ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: cn("h-4.5 w-4.5 transition-transform group-hover:scale-110", active && "drop-shadow") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: label })
        ] }, to);
      })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 rounded-2xl border border-sidebar-border bg-sidebar-accent/40 p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground", children: fullName.charAt(0).toUpperCase() }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-medium", children: fullName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-[11px] text-muted-foreground", children: email })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onSignOut, "aria-label": "Sign out", className: "rounded-lg p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }) })
    ] }) })
  ] });
}
export {
  AppLayout as component
};
