import { U as reactExports, L as jsxRuntimeExports } from "./server-BB9Vuddr.mjs";
import { O as useNavigate, J as useAuth, D as signIn, F as toast, E as signUp, p as getAdminCredentials } from "./router-CTdYHFOk.mjs";
import { B as Button } from "./button-B_NfezXh.mjs";
import { I as Input } from "./input-B3Kt6F9h.mjs";
import { L as Label } from "./label-BPM5O42P.mjs";
import { T as Tabs, b as TabsList, c as TabsTrigger, a as TabsContent } from "./tabs-BGBPJ98U.mjs";
import { G as GraduationCap } from "./graduation-cap-CUuo92-b.mjs";
import { c as createLucideIcon } from "./createLucideIcon-CEt2Dx5A.mjs";
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
const __iconNode$1 = [["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]];
const LoaderCircle = createLucideIcon("loader-circle", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",
      key: "1s2grr"
    }
  ],
  ["path", { d: "M20 2v4", key: "1rf3ol" }],
  ["path", { d: "M22 4h-4", key: "gwowj6" }],
  ["circle", { cx: "4", cy: "20", r: "2", key: "6kqj1y" }]
];
const Sparkles = createLucideIcon("sparkles", __iconNode);
const OTP_CONFIGURED = false;
function LoginPage() {
  const adminEmail = getAdminCredentials().email;
  const navigate = useNavigate();
  const {
    session,
    loading,
    refresh
  } = useAuth();
  const [busy, setBusy] = reactExports.useState(false);
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [name, setName] = reactExports.useState("");
  const [username, setUsername] = reactExports.useState("");
  const [otp, setOtp] = reactExports.useState("");
  const [otpSent, setOtpSent] = reactExports.useState(false);
  const [emailVerified, setEmailVerified] = reactExports.useState(!OTP_CONFIGURED);
  reactExports.useEffect(() => {
    if (!loading && session) navigate({
      to: "/dashboard"
    });
  }, [session, loading, navigate]);
  const handleSignIn = async (e) => {
    e.preventDefault();
    setBusy(true);
    const {
      session: s,
      error
    } = await signIn(email, password);
    setBusy(false);
    if (error) return toast.error(error);
    await refresh();
    toast.success("Welcome back");
    navigate({
      to: "/dashboard"
    });
  };
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!emailVerified) return toast.error("Verify your email with the OTP first");
    setBusy(true);
    const {
      error
    } = await signUp(email, password, name, username);
    setBusy(false);
    if (error) return toast.error(error);
    await refresh();
    toast.success("Account created — welcome!");
    navigate({
      to: "/dashboard"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex min-h-screen items-center justify-center px-4 py-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 -z-10 [background-image:var(--gradient-hero)]" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid w-full max-w-5xl gap-8 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong relative hidden flex-col justify-between rounded-3xl p-10 md:flex", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-medium", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GraduationCap, { className: "h-5 w-5 text-primary-foreground" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "University Command Center" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-10 text-4xl font-semibold tracking-tight", children: [
            "Make your semester ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gradient", children: "feel inevitable." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-muted-foreground", children: "Track courses, attendance and deep work — all saved locally in your browser." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: ["Pomodoro deep work + study streaks", "Kanban assignments & exam readiness", "Weekly routine planner"].map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-[var(--cyan)]" }),
          " ",
          f
        ] }, f)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong rounded-3xl p-8 sm:p-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold", children: "Welcome" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Sign in — your data is saved to Supabase in the cloud." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "signin", className: "mt-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "signin", children: "Sign in" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "signup", children: "Sign up" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "signin", className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSignIn, className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "Email" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "email", type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@university.edu" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pw", children: "Password" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "pw", type: "password", required: true, value: password, onChange: (e) => setPassword(e.target.value), placeholder: "••••••••" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: busy, className: "w-full bg-gradient-primary text-primary-foreground shadow-glow", children: [
              busy && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
              " Sign in"
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "signup", className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSignUp, className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "name", children: "Full name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "name", value: name, onChange: (e) => setName(e.target.value), placeholder: "Your name" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "username", children: "Username" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "username", required: true, minLength: 3, maxLength: 24, value: username, onChange: (e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, "")), placeholder: "e.g. srijon_sharma", autoComplete: "username" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "3–24 characters · letters, numbers, underscore" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email2", children: "Email" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "email2", type: "email", required: true, value: email, onChange: (e) => {
                  setEmail(e.target.value);
                  setEmailVerified(!OTP_CONFIGURED);
                  setOtpSent(false);
                }, className: "flex-1" }),
                OTP_CONFIGURED
              ] })
            ] }),
            OTP_CONFIGURED,
            emailVerified && OTP_CONFIGURED,
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pw2", children: "Password" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "pw2", type: "password", required: true, minLength: 6, value: password, onChange: (e) => setPassword(e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: busy || !emailVerified, className: "w-full bg-gradient-primary text-primary-foreground shadow-glow", children: [
              busy && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
              " Create account"
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-6 text-center text-[10px] text-muted-foreground", children: [
          "Administrator? Sign in with ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: adminEmail }),
          " — change password in Settings or Admin."
        ] })
      ] })
    ] })
  ] });
}
export {
  LoginPage as component
};
