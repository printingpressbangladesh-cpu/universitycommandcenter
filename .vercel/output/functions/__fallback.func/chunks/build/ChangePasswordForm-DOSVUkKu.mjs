import { U as reactExports, L as jsxRuntimeExports } from "./server-BB9Vuddr.mjs";
import { F as toast, f as changePassword } from "./router-CTdYHFOk.mjs";
import { B as Button } from "./button-B_NfezXh.mjs";
import { I as Input } from "./input-B3Kt6F9h.mjs";
import { L as Label } from "./label-BPM5O42P.mjs";
import { c as createLucideIcon } from "./createLucideIcon-CEt2Dx5A.mjs";
const __iconNode = [
  [
    "path",
    {
      d: "M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z",
      key: "1s6t7t"
    }
  ],
  ["circle", { cx: "16.5", cy: "7.5", r: ".5", fill: "currentColor", key: "w0ekpg" }]
];
const KeyRound = createLucideIcon("key-round", __iconNode);
function ChangePasswordForm({ userId, compact }) {
  const [current, setCurrent] = reactExports.useState("");
  const [next, setNext] = reactExports.useState("");
  const [confirm, setConfirm] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (next !== confirm) {
      toast.error("New passwords do not match");
      return;
    }
    setBusy(true);
    const { error } = await changePassword(userId, current, next);
    setBusy(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Password updated");
    setCurrent("");
    setNext("");
    setConfirm("");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => void submit(e), className: compact ? "mt-4 space-y-3" : "mt-4 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pw-current", children: "Current password" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "pw-current",
          type: "password",
          autoComplete: "current-password",
          value: current,
          onChange: (e) => setCurrent(e.target.value),
          required: true,
          className: compact ? "h-9" : void 0
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: compact ? "grid gap-3 sm:grid-cols-2" : "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pw-new", children: "New password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "pw-new",
            type: "password",
            autoComplete: "new-password",
            minLength: 6,
            value: next,
            onChange: (e) => setNext(e.target.value),
            required: true,
            className: compact ? "h-9" : void 0
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pw-confirm", children: "Confirm new password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "pw-confirm",
            type: "password",
            autoComplete: "new-password",
            minLength: 6,
            value: confirm,
            onChange: (e) => setConfirm(e.target.value),
            required: true,
            className: compact ? "h-9" : void 0
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: busy, className: "gap-2", variant: compact ? "secondary" : "default", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { className: "h-4 w-4" }),
      busy ? "Updating…" : "Update password"
    ] })
  ] });
}
export {
  ChangePasswordForm as C,
  KeyRound as K
};
