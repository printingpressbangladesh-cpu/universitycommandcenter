export const DATA_CHANGED = "ucc-data-changed";

export function emitDataChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(DATA_CHANGED));
  }
}

export function onDataChanged(handler: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(DATA_CHANGED, handler);
  return () => window.removeEventListener(DATA_CHANGED, handler);
}
