import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { deleteRoutine, listRoutines, upsertRoutine } from "@/lib/supabase/data";
import type { RoutineBlock } from "@/lib/types";

export type { RoutineBlock };

const DAYS: RoutineBlock["day"][] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type RoutineContextValue = {
  blocks: RoutineBlock[];
  days: RoutineBlock["day"][];
  addBlock: (block: Omit<RoutineBlock, "id">) => void;
  removeBlock: (id: string) => void;
};

const RoutineContext = createContext<RoutineContextValue | null>(null);

export function RoutineProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [blocks, setBlocks] = useState<RoutineBlock[]>([]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    void listRoutines(userId).then((rows) => {
      if (!cancelled) setBlocks(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const addBlock = useCallback(
    (block: Omit<RoutineBlock, "id">) => {
      const entry: RoutineBlock = { ...block, id: crypto.randomUUID() };
      setBlocks((prev) => [...prev, entry].sort((a, b) => a.day.localeCompare(b.day) || a.start.localeCompare(b.start)));
      if (userId) void upsertRoutine(userId, entry);
    },
    [userId],
  );

  const removeBlock = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    void deleteRoutine(id);
  }, []);

  const value = useMemo(() => ({ blocks, days: DAYS, addBlock, removeBlock }), [blocks, addBlock, removeBlock]);

  return <RoutineContext.Provider value={value}>{children}</RoutineContext.Provider>;
}

export function useRoutine() {
  const ctx = useContext(RoutineContext);
  if (!ctx) throw new Error("useRoutine must be used within RoutineProvider");
  return ctx;
}
