import { L as jsxRuntimeExports } from "./server-BB9Vuddr.mjs";
import { S as Select, d as SelectTrigger, e as SelectValue, b as SelectContent, c as SelectItem } from "./select-DHN0rxF_.mjs";
import { c as cn } from "./utils-CZ556u-x.mjs";
function CourseSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select…",
  className,
  triggerClassName
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value, onValueChange, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: cn("h-10 rounded-xl border-border/60 bg-secondary/40 shadow-sm backdrop-blur-sm", triggerClassName, className), children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: options.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.value, children: o.label }, o.value)) })
  ] });
}
export {
  CourseSelect as C
};
