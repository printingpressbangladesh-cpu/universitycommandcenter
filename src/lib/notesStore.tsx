import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { listNotes, replaceNotes } from "@/lib/supabase/data";
import type { Note } from "@/lib/types";

type NotesContextValue = {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
};

const NotesContext = createContext<NotesContextValue | null>(null);

export function NotesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    void listNotes(userId).then((rows) => {
      if (!cancelled) setNotes(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const persist = useCallback(
    async (list: Note[]) => {
      if (!userId) return;
      await replaceNotes(userId, list);
    },
    [userId],
  );

  const setNotesWrapped: React.Dispatch<React.SetStateAction<Note[]>> = useCallback(
    (action) => {
      setNotes((prev) => {
        const next = typeof action === "function" ? action(prev) : action;
        void persist(next);
        return next;
      });
    },
    [persist],
  );

  const value = useMemo(() => ({ notes, setNotes: setNotesWrapped }), [notes, setNotesWrapped]);

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotes must be used within NotesProvider");
  return ctx;
}
