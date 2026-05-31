import { L as jsxRuntimeExports } from "./server-BB9Vuddr.mjs";
import { V as useTheme, J as useAuth, O as useNavigate, L as Link, F as toast, k as deleteAllUserData } from "./router-CTdYHFOk.mjs";
import { K as KeyRound, C as ChangePasswordForm } from "./ChangePasswordForm-DOSVUkKu.mjs";
import { S as Shield } from "./shield-BzuPlltJ.mjs";
import { M as Moon, S as Sun, L as LogOut } from "./sun-AX_p2AM5.mjs";
import { T as Trash2 } from "./trash-2-rIKLTn3v.mjs";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./button-B_NfezXh.mjs";
import "./index-0UuDEara.mjs";
import "./utils-CZ556u-x.mjs";
import "./clsx-DgYk2OaC.mjs";
import "./input-B3Kt6F9h.mjs";
import "./label-BPM5O42P.mjs";
import "./createLucideIcon-CEt2Dx5A.mjs";
async function resetUserData(userId) {
  await deleteAllUserData(userId);
}
function SettingsPage() {
  const {
    theme,
    set
  } = useTheme();
  const {
    user,
    signOut,
    isAdmin
  } = useAuth();
  const navigate = useNavigate();
  const name = user?.user_metadata?.full_name || "Student";
  user?.user_metadata?.username;
  user?.user_metadata?.role;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-3xl space-y-6 animate-fade-in-up", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Settings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Personalize your command center · data synced to Supabase" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "glass-strong rounded-3xl p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold uppercase tracking-wider text-muted-foreground", children: "Profile" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-14 w-14 place-items-center rounded-full bg-gradient-primary text-xl font-semibold text-primary-foreground shadow-glow", children: name.charAt(0).toUpperCase() }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-semibold", children: name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: user?.email }),
          isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 inline-block rounded-full bg-[color:var(--purple)]/20 px-2 py-0.5 text-[10px] font-medium uppercase text-[color:var(--purple)]", children: "Admin" })
        ] })
      ] })
    ] }),
    user?.id && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "glass-strong rounded-3xl p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { className: "h-4 w-4" }),
        " Password"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Change your sign-in password. Works for student and administrator accounts." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChangePasswordForm, { userId: user.id })
    ] }),
    isAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "glass-strong rounded-3xl p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold uppercase tracking-wider text-muted-foreground", children: "Administrator" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Configure email reminders, Google Form link, and system-wide notification sync." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/admin", className: "mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4" }),
        " Open admin panel"
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "glass-strong rounded-3xl p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold uppercase tracking-wider text-muted-foreground", children: "Email reminders" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-muted-foreground", children: [
        "Class reminders, deadlines, and wellness check-ins are configured by your administrator. Use",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Sync email reminders" }),
        " on Routine or Exams after your admin enables them."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "glass-strong rounded-3xl p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold uppercase tracking-wider text-muted-foreground", children: "Appearance" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 grid grid-cols-2 gap-3", children: ["dark", "light"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => set(t), className: `flex items-center gap-3 rounded-2xl border p-4 text-left transition ${theme === t ? "border-primary bg-primary/10" : "border-border/60 hover:bg-secondary/40"}`, children: [
        t === "dark" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "h-5 w-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-medium capitalize", children: [
            t,
            " mode"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: t === "dark" ? "Deep navy command palette" : "Off-white minimal" })
        ] })
      ] }, t)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "glass-strong rounded-3xl p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold uppercase tracking-wider text-muted-foreground", children: "Data" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Remove all courses, assignments, notes, and other data for this account on this device." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: async () => {
        if (!user?.id) return;
        if (!confirm("Delete all your data on this device? This cannot be undone.")) return;
        await resetUserData(user.id);
        toast.success("All data cleared");
        window.location.href = "/dashboard";
      }, className: "mt-4 inline-flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }),
        " Reset all my data"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: async () => {
      await signOut();
      navigate({
        to: "/login"
      });
    }, className: "inline-flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }),
      " Sign out"
    ] })
  ] });
}
export {
  SettingsPage as component
};
