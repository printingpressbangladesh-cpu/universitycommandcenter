import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useCourses } from "@/lib/coursesStore";
import { useNotes } from "@/lib/notesStore";
import type { Note } from "@/lib/types";
import { Pin, Plus, Search, Trash2, Calendar, FileText } from "lucide-react";
import { toast } from "sonner";

function stripHtml(html: string) {
  if (typeof document === "undefined") return html;
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

export const Route = createFileRoute("/_app/notes/")({
  component: NotesIndexPage,
  head: () => ({ meta: [{ title: "Notes · University Command Center" }] }),
});

function NotesIndexPage() {
  const navigate = useNavigate();
  const { notes, setNotes } = useNotes();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const sorted = [...notes].sort((a, b) => (Number(b.pinned) - Number(a.pinned)) || (+new Date(b.updatedAt) - +new Date(a.updatedAt)));
    if (!q) return sorted;
    const ql = q.toLowerCase();
    return sorted.filter((n) => n.title.toLowerCase().includes(ql) || n.body.toLowerCase().includes(ql) || n.tags.some((t) => t.includes(ql)));
  }, [notes, q]);

  const create = () => {
    const n: Note = { id: crypto.randomUUID(), title: "Untitled Note", body: "", tags: [], pinned: false, updatedAt: new Date().toISOString() };
    setNotes((p) => [n, ...p]);
    toast.success("New note created");
    navigate({ to: "/notes/$noteId", params: { noteId: n.id } });
  };

  const remove = (id: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      setNotes((p) => p.filter((n) => n.id !== id));
      toast.success("Note deleted");
    }
  };

  const togglePin = (id: string, currentPinned: boolean) => {
    setNotes((p) => p.map((n) => (n.id === id ? { ...n, pinned: !currentPinned, updatedAt: new Date().toISOString() } : n)));
    toast.success(currentPinned ? "Note unpinned" : "Note pinned");
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
          <p className="text-sm text-muted-foreground">Organize lecture notes, formulas and exam summaries</p>
        </div>
        <button onClick={create} className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow shrink-0 cursor-pointer">
          <Plus className="h-4 w-4" /> New note
        </button>
      </header>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input 
          value={q} 
          onChange={(e)=>setQ(e.target.value)} 
          placeholder="Search notes by title, content or tags..." 
          className="h-10 w-full rounded-xl border border-border/60 bg-secondary/40 pl-9 pr-3 text-sm outline-none focus:border-ring" 
        />
      </div>

      {filtered.length === 0 ? (
        <div className="glass-strong rounded-3xl p-12 text-center space-y-4">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-secondary/60">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">No notes found</p>
            <p className="text-xs text-muted-foreground">
              {q ? "Try adjusting your search query" : "Get started by creating your first lecture or study note."}
            </p>
          </div>
          {!q && (
            <button onClick={create} className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-4 py-2 text-xs font-medium text-foreground hover:bg-secondary/80 transition cursor-pointer">
              <Plus className="h-3 w-3" /> Create a note
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((n) => {
            const cleanBody = stripHtml(n.body);
            return (
              <article 
                key={n.id} 
                className="glass-strong group relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 hover-lift cursor-pointer animate-fade-in-up"
                onClick={() => navigate({ to: "/notes/$noteId", params: { noteId: n.id } })}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-base font-semibold line-clamp-1 group-hover:text-primary transition-colors flex-1 min-w-0">
                      {n.title || "Untitled Note"}
                    </h2>
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => togglePin(n.id, !!n.pinned)} 
                        className={`rounded-lg p-1.5 transition cursor-pointer ${n.pinned ? "bg-[color:var(--cyan)]/15 text-[color:var(--cyan)]" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
                        title={n.pinned ? "Unpin note" : "Pin note"}
                      >
                        <Pin className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => remove(n.id)} 
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition cursor-pointer"
                        title="Delete note"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground line-clamp-3 leading-relaxed break-words">
                    {cleanBody || "No content yet..."}
                  </p>
                </div>

                <div className="mt-6 space-y-3">
                  {/* Meta badges: Course & Tags */}
                  {(n.course || (n.tags && n.tags.length > 0)) && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {n.course && (
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary border border-primary/20">
                          {n.course}
                        </span>
                      )}
                      {n.tags?.map((t) => (
                        <span key={t} className="rounded-md bg-secondary/80 px-2 py-0.5 text-[10px] text-muted-foreground">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground border-t border-border/40 pt-3">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Updated {new Date(n.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })} at {new Date(n.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
