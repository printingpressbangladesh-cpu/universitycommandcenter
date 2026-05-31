import { U as reactExports, L as jsxRuntimeExports } from "./server-BB9Vuddr.mjs";
import { J as useAuth, O as useNavigate, S as useSemester, r as getSystemEmailConfig, o as formatStudyMinutes, q as getRoleLabel, T as TEAM_ROLES, w as listStudentProfiles, x as listTeamMembersAll, F as toast, p as getAdminCredentials, C as saveSystemEmailConfig, A as removeTeamMember$1, h as createTeamMember$1 } from "./router-CTdYHFOk.mjs";
import { K as KeyRound, C as ChangePasswordForm } from "./ChangePasswordForm-DOSVUkKu.mjs";
import { B as Button } from "./button-B_NfezXh.mjs";
import { I as Input } from "./input-B3Kt6F9h.mjs";
import { L as Label } from "./label-BPM5O42P.mjs";
import { T as Tabs, b as TabsList, c as TabsTrigger, a as TabsContent } from "./tabs-BGBPJ98U.mjs";
import { a as ChevronUp, C as ChevronDown, S as Select, d as SelectTrigger, e as SelectValue, b as SelectContent, c as SelectItem } from "./select-DHN0rxF_.mjs";
import { S as Shield } from "./shield-BzuPlltJ.mjs";
import { c as createLucideIcon } from "./createLucideIcon-CEt2Dx5A.mjs";
import { M as Mail } from "./mail-F3NjZY6i.mjs";
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
import "./index-BcqomYnJ.mjs";
import "./index-B1Mostm-.mjs";
import "./check-CvBesx_l.mjs";
const __iconNode$2 = [
  ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
  ["path", { d: "M8 16H3v5", key: "1cv678" }]
];
const RefreshCw = createLucideIcon("refresh-cw", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
  ["line", { x1: "19", x2: "19", y1: "8", y2: "14", key: "1bvyxn" }],
  ["line", { x1: "22", x2: "16", y1: "11", y2: "11", key: "1shjgl" }]
];
const UserPlus = createLucideIcon("user-plus", __iconNode$1);
const __iconNode = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744", key: "16gr8j" }],
  ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
];
const Users = createLucideIcon("users", __iconNode);
async function getStudentProfiles() {
  return listStudentProfiles();
}
async function getTeamMembers() {
  return listTeamMembersAll();
}
async function createTeamMember(input) {
  return createTeamMember$1(input);
}
async function removeTeamMember(userId) {
  return removeTeamMember$1(userId);
}
function AdminPage() {
  const {
    isAdmin,
    user
  } = useAuth();
  const navigate = useNavigate();
  const {
    syncToGoogle
  } = useSemester();
  const creds = getAdminCredentials();
  const [adminForm, setAdminForm] = reactExports.useState("");
  const [enabled, setEnabled] = reactExports.useState(false);
  const [lastSynced, setLastSynced] = reactExports.useState();
  const [loading, setLoading] = reactExports.useState(true);
  const [students, setStudents] = reactExports.useState([]);
  const [team, setTeam] = reactExports.useState([]);
  const [expandedId, setExpandedId] = reactExports.useState(null);
  const [teamEmail, setTeamEmail] = reactExports.useState("");
  const [teamUsername, setTeamUsername] = reactExports.useState("");
  const [teamName, setTeamName] = reactExports.useState("");
  const [teamPassword, setTeamPassword] = reactExports.useState("");
  const [teamRole, setTeamRole] = reactExports.useState("student_support");
  const [teamBusy, setTeamBusy] = reactExports.useState(false);
  const reloadDirectory = reactExports.useCallback(async () => {
    const [s, t] = await Promise.all([getStudentProfiles(), getTeamMembers()]);
    setStudents(s);
    setTeam(t);
  }, []);
  reactExports.useEffect(() => {
    if (!isAdmin) {
      navigate({
        to: "/dashboard"
      });
      return;
    }
    void Promise.all([getSystemEmailConfig(), reloadDirectory()]).then(([c]) => {
      setAdminForm(c.adminFormUrl);
      setEnabled(c.enabled);
      setLastSynced(c.lastSyncedAt);
      setLoading(false);
    });
  }, [isAdmin, navigate, reloadDirectory]);
  if (!isAdmin || loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground", children: loading ? "Loading…" : "Redirecting…" });
  }
  const save = async (andSync) => {
    try {
      const next = await saveSystemEmailConfig({
        adminFormUrl: adminForm,
        enabled
      });
      setLastSynced(next.lastSyncedAt);
      toast.success("System email settings saved");
      if (andSync) {
        await syncToGoogle();
        const updated = await getSystemEmailConfig();
        setLastSynced(updated.lastSyncedAt);
        toast.success("Synced with Google Apps Script");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };
  const addTeamMember = async (e) => {
    e.preventDefault();
    setTeamBusy(true);
    const {
      error
    } = await createTeamMember({
      email: teamEmail,
      username: teamUsername,
      fullName: teamName,
      password: teamPassword,
      role: teamRole
    });
    setTeamBusy(false);
    if (error) return toast.error(error);
    toast.success("Team member added");
    setTeamEmail("");
    setTeamUsername("");
    setTeamName("");
    setTeamPassword("");
    await reloadDirectory();
  };
  const handleRemoveTeam = async (id, name) => {
    if (!confirm(`Remove ${name} from the team? They will become a student account.`)) return;
    const {
      error
    } = await removeTeamMember(id);
    if (error) return toast.error(error);
    toast.success("Removed from team");
    await reloadDirectory();
  };
  const staffTeam = team.filter((m) => m.role !== "admin");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl space-y-6 animate-fade-in-up", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[color:var(--purple)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold uppercase tracking-wider", children: "Administrator" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-2 text-2xl font-semibold tracking-tight", children: "Administration" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Manage students, team members, and system email settings." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "students", className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "students", className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3.5 w-3.5" }),
          " Students"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "team", className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-3.5 w-3.5" }),
          " Team"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "email", className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-3.5 w-3.5" }),
          " Email"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "students", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "glass-strong rounded-3xl p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-semibold uppercase tracking-wider text-muted-foreground", children: [
          "All students (",
          students.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Overview of every registered student on this device — expand for course and activity details." }),
        students.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 text-sm text-muted-foreground", children: "No student accounts yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-4 space-y-2", children: students.map((s) => {
          const open = expandedId === s.id;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "rounded-2xl border border-border/60 bg-secondary/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setExpandedId(open ? null : s.id), className: "flex w-full items-center justify-between gap-3 p-4 text-left", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: s.fullName }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
                  "@",
                  s.username,
                  " · ",
                  s.email
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 items-center gap-3 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-primary/15 px-2 py-0.5 text-primary", children: [
                  s.courseCount,
                  " courses"
                ] }),
                open ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4" })
              ] })
            ] }),
            open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border/60 px-4 pb-4 pt-3 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "grid gap-2 sm:grid-cols-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-xs text-muted-foreground", children: "Joined" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: new Date(s.createdAt).toLocaleDateString() })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-xs text-muted-foreground", children: "Avg attendance" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: s.avgAttendance !== null ? `${s.avgAttendance}%` : "—" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-xs text-muted-foreground", children: "Assignments" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("dd", { children: [
                    s.assignmentCount,
                    " total · ",
                    s.pendingAssignments,
                    " pending"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-xs text-muted-foreground", children: "Exams" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: s.examCount })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-xs text-muted-foreground", children: "Study this week" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: formatStudyMinutes(s.studyMinutesThisWeek) })
                ] })
              ] }),
              s.courses.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Courses" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-2 space-y-2", children: s.courses.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex flex-wrap justify-between gap-2 rounded-xl bg-background/40 px-3 py-2 text-xs", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: c.code }),
                    " — ",
                    c.name
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                    c.attendance,
                    "% att. · ",
                    c.marks,
                    "% marks · ",
                    c.credits,
                    " cr"
                  ] })
                ] }, c.code)) })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs text-muted-foreground", children: "No courses added yet." })
            ] })
          ] }, s.id);
        }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "team", className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "glass-strong rounded-3xl p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold uppercase tracking-wider text-muted-foreground", children: "Team members" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Student support, technical, operations, and academic staff — separate from student accounts." }),
          staffTeam.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm text-muted-foreground", children: "No team members yet. Add one below." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-4 space-y-2", children: staffTeam.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-secondary/20 px-4 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: m.fullName }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
                "@",
                m.username,
                " · ",
                m.email
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 inline-block rounded-full bg-[color:var(--cyan)]/15 px-2 py-0.5 text-[10px] font-medium text-[color:var(--cyan)]", children: getRoleLabel(m.role) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "sm", className: "text-destructive hover:text-destructive", onClick: () => void handleRemoveTeam(m.id, m.fullName), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
          ] }, m.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "glass-strong rounded-3xl p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-4 w-4" }),
            " Add team member"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => void addTeamMember(e), className: "mt-4 grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Full name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: teamName, onChange: (e) => setTeamName(e.target.value), required: true })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Username" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: teamUsername, onChange: (e) => setTeamUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, "")), required: true, minLength: 3 })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: teamEmail, onChange: (e) => setTeamEmail(e.target.value), required: true })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Role" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: teamRole, onValueChange: (v) => setTeamRole(v), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TEAM_ROLES.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r, children: getRoleLabel(r) }, r)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 sm:col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Temporary password" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "password", minLength: 6, value: teamPassword, onChange: (e) => setTeamPassword(e.target.value), required: true }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Share securely; they can change it in Settings." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: teamBusy, className: "sm:col-span-2 bg-gradient-primary text-primary-foreground", children: teamBusy ? "Adding…" : "Add to team" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "email", className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "glass-strong rounded-3xl p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { className: "h-4 w-4" }),
            " Admin account"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-muted-foreground", children: [
            "Signed in as ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: user?.email }),
            " (@",
            creds.username,
            "). Default admin:",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: creds.email })
          ] }),
          user?.id && /* @__PURE__ */ jsxRuntimeExports.jsx(ChangePasswordForm, { userId: user.id, compact: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "glass-strong rounded-3xl p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold uppercase tracking-wider text-muted-foreground", children: "Email reminders" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "One email the day before with all tomorrow's classes, plus deadline alerts. After 7 days without attendance, a check-in email is sent." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "admin-form", children: "Admin / support Google Form URL" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "admin-form", type: "url", value: adminForm, onChange: (e) => setAdminForm(e.target.value), placeholder: "https://docs.google.com/forms/d/..." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex cursor-pointer items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: enabled, onChange: (e) => setEnabled(e.target.checked), className: "h-4 w-4 rounded border-border" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Enable scheduled emails for all students" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "secondary", className: "gap-2", onClick: () => void save(false), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-4 w-4" }),
                " Save"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", className: "gap-2 bg-gradient-primary text-primary-foreground", onClick: () => void save(true), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }),
                " Save & sync"
              ] })
            ] }),
            lastSynced && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "Last synced: ",
              new Date(lastSynced).toLocaleString()
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  AdminPage as component
};
