import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useCourses } from "@/lib/coursesStore";
import { useNotes } from "@/lib/notesStore";
import type { Note } from "@/lib/types";
import { CourseSelect } from "@/components/CourseSelect";
import { Pin, Plus, Search, Trash2, PanelLeft, PanelLeftClose } from "lucide-react";
import { DocsEditor } from "@/components/DocsEditor";

function stripHtml(html: string) {
  if (typeof document === "undefined") return html;
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

export const Route = createFileRoute("/_app/notes")({
  component: NotesPage,
  head: () => ({ meta: [{ title: "Notes · University Command Center" }] }),
});


function NotesPage() {
  const { courses } = useCourses();
  const { notes, setNotes } = useNotes();
  const [selectedId, setSelectedId] = useState<string>("");
  const [q, setQ] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    if (!selectedId && notes[0]) setSelectedId(notes[0].id);
  }, [notes, selectedId]);

  const filtered = useMemo(() => {
    const sorted = [...notes].sort((a, b) => (Number(b.pinned) - Number(a.pinned)) || (+new Date(b.updatedAt) - +new Date(a.updatedAt)));
    if (!q) return sorted;
    const ql = q.toLowerCase();
    return sorted.filter((n) => n.title.toLowerCase().includes(ql) || n.body.toLowerCase().includes(ql) || n.tags.some((t) => t.includes(ql)));
  }, [notes, q]);

  const selected = notes.find((n) => n.id === selectedId) ?? filtered[0];

  const update = (patch: Partial<Note>) => {
    if (!selected) return;
    setNotes((p) => p.map((n) => (n.id === selected.id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n)));
  };

  const create = () => {
    const n: Note = { id: crypto.randomUUID(), title: "Untitled", body: "", tags: [], pinned: false, updatedAt: new Date().toISOString() };
    setNotes((p) => [n, ...p]);
    setSelectedId(n.id);
    setShowSidebar(false);
  };

  const remove = (id: string) => {
    setNotes((p) => p.filter((n) => n.id !== id));
    if (selectedId === id) setSelectedId(filtered.find((n) => n.id !== id)?.id ?? "");
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
          <p className="text-sm text-muted-foreground">Organize lecture notes, formulas and exam summaries</p>
        </div>
        <button onClick={create} className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow">
          <Plus className="h-4 w-4" /> New note
        </button>
      </header>

      <div className={`grid gap-5 transition-all duration-300 ${
        showSidebar ? "lg:grid-cols-[320px_1fr] grid-cols-1" : "grid-cols-1"
      }`}>
        <aside className={`glass-strong rounded-3xl p-3 transition-all ${
          showSidebar ? "block" : "hidden"
        }`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search notes" className="h-10 w-full rounded-xl border border-border/60 bg-secondary/40 pl-9 pr-3 text-sm outline-none focus:border-ring" />
          </div>
          <ul className="mt-3 max-h-[60vh] space-y-1 overflow-y-auto">
            {filtered.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => {
                    setSelectedId(n.id);
                    if (window.innerWidth < 1024) {
                      setShowSidebar(false);
                    }
                  }}
                  className={`group flex w-full items-start gap-2 rounded-2xl p-3 text-left transition ${selected?.id === n.id ? "bg-secondary/70" : "hover:bg-secondary/40"}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-sm font-medium">
                      {n.pinned && <Pin className="h-3 w-3 text-[color:var(--cyan)]" />}
                      <span className="truncate">{n.title}</span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{stripHtml(n.body) || "No content yet…"}</p>
                    {n.course && <span className="mt-1 inline-block rounded-md bg-secondary px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{n.course}</span>}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className={`glass-strong rounded-3xl p-6 transition-all ${
          !showSidebar ? "block" : "hidden lg:block"
        }`}>
          {selected ? (
            <>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="rounded-xl p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all border border-border/40 flex items-center justify-center shrink-0"
                  title={showSidebar ? "Collapse Sidebar" : "Expand Sidebar"}
                >
                  {showSidebar ? <PanelLeftClose className="h-4.5 w-4.5" /> : <PanelLeft className="h-4.5 w-4.5" />}
                </button>
                <input value={selected.title} onChange={(e)=>update({ title: e.target.value })} className="flex-1 border-0 bg-transparent text-2xl font-semibold outline-none placeholder:text-muted-foreground" placeholder="Note title" />
                <button onClick={()=>update({ pinned: !selected.pinned })} className={`rounded-lg p-2 transition ${selected.pinned ? "bg-[color:var(--cyan)]/15 text-[color:var(--cyan)]" : "text-muted-foreground hover:bg-secondary"}`} aria-label="Pin">
                  <Pin className="h-4 w-4" />
                </button>
                <button onClick={()=>remove(selected.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <CourseSelect
                  value={selected.course ?? "none"}
                  onValueChange={(v) => update({ course: v === "none" ? undefined : v })}
                  triggerClassName="h-8 w-36 text-xs"
                  options={[
                    { value: "none", label: "No course" },
                    ...courses.map((c) => ({ value: c.code, label: c.code })),
                  ]}
                />
                <input
                  defaultValue={selected.tags.join(", ")}
                  onBlur={(e)=>update({ tags: e.target.value.split(",").map(s=>s.trim()).filter(Boolean) })}
                  placeholder="tags, comma separated"
                  className="flex-1 rounded-lg border border-border/60 bg-secondary/40 px-2 py-1 text-xs outline-none"
                />
                <span className="text-muted-foreground">Updated {new Date(selected.updatedAt).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}</span>
              </div>
              <div className="mt-4 h-[55vh]">
                <DocsEditor
                  value={selected.body}
                  onChange={(html) => update({ body: html })}
                  noteId={selected.id}
                  placeholder="Start writing notes… Use the toolbar for styles, lists, and tables."
                />
              </div>
            </>
          ) : (
            <div className="grid h-[60vh] place-items-center text-muted-foreground">
              <div className="text-center space-y-3">
                <p>No notes yet — create your first one.</p>
                <button
                  type="button"
                  onClick={() => setShowSidebar(true)}
                  className="lg:hidden text-xs text-primary underline"
                >
                  Show Notes List
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
