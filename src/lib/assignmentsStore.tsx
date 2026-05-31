import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { listAssignments, replaceAssignments } from "@/lib/supabase/data";
import type { Assignment } from "@/lib/types";

type AssignmentsContextValue = {
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  addAssignment: (input: Omit<Assignment, "id">) => void;
  updateAssignment: (id: string, patch: Partial<Assignment>) => void;
  removeAssignment: (id: string) => void;
};

const AssignmentsContext = createContext<AssignmentsContextValue | null>(null);

export function AssignmentsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    void listAssignments(userId).then((rows) => {
      if (!cancelled) setAssignments(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const persist = useCallback(
    async (list: Assignment[]) => {
      if (!userId) return;
      await replaceAssignments(userId, list);
    },
    [userId],
  );

  const addAssignment = useCallback(
    (input: Omit<Assignment, "id">) => {
      const entry: Assignment = { ...input, id: crypto.randomUUID() };
      setAssignments((prev) => {
        const next = [...prev, entry];
        void persist(next);
        return next;
      });
    },
    [persist],
  );

  const updateAssignment = useCallback(
    (id: string, patch: Partial<Assignment>) => {
      setAssignments((prev) => {
        const next = prev.map((a) => (a.id === id ? { ...a, ...patch } : a));
        void persist(next);
        return next;
      });
    },
    [persist],
  );

  const removeAssignment = useCallback(
    (id: string) => {
      setAssignments((prev) => {
        const next = prev.filter((a) => a.id !== id);
        void persist(next);
        return next;
      });
    },
    [persist],
  );

  const setAssignmentsWrapped: React.Dispatch<React.SetStateAction<Assignment[]>> = useCallback(
    (action) => {
      setAssignments((prev) => {
        const next = typeof action === "function" ? action(prev) : action;
        void persist(next);
        return next;
      });
    },
    [persist],
  );

  const value = useMemo(
    () => ({
      assignments,
      setAssignments: setAssignmentsWrapped,
      addAssignment,
      updateAssignment,
      removeAssignment,
    }),
    [assignments, setAssignmentsWrapped, addAssignment, updateAssignment, removeAssignment],
  );

  return <AssignmentsContext.Provider value={value}>{children}</AssignmentsContext.Provider>;
}

export function useAssignments() {
  const ctx = useContext(AssignmentsContext);
  if (!ctx) throw new Error("useAssignments must be used within AssignmentsProvider");
  return ctx;
}
