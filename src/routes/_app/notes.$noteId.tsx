import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCourses } from "@/lib/coursesStore";
import { useNotes } from "@/lib/notesStore";
import type { Note } from "@/lib/types";
import { CourseSelect } from "@/components/CourseSelect";
import { Pin, Trash2, ArrowLeft } from "lucide-react";
import { DocsEditor } from "@/components/DocsEditor";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/notes/$noteId")({
  component: NoteDetailPage,
});

function NoteDetailPage() {
  const { noteId } = Route.useParams();
  const { courses } = useCourses();
  const { notes, setNotes } = useNotes();
  const navigate = useNavigate();

  const note = notes.find((n) => n.id === noteId);

  const update = (patch: Partial<Note>) => {
    if (!note) return;
    setNotes((p) =>
      p.map((n) => (n.id === note.id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n))
    );
  };

  const remove = () => {
    if (!note) return;
    if (confirm("Are you sure you want to delete this note?")) {
      setNotes((p) => p.filter((n) => n.id !== note.id));
      toast.success("Note deleted");
      navigate({ to: "/notes" });
    }
  };

  if (!note) {
    return (
      <div className="glass-strong rounded-3xl p-8 text-center space-y-4 animate-fade-in-up">
        <p className="text-muted-foreground">Note not found or deleted.</p>
        <Link to="/notes" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to notes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Back navigation */}
      <Link to="/notes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All notes
      </Link>

      <section className="glass-strong rounded-3xl p-6 space-y-4">
        {/* Title and main actions row */}
        <div className="flex items-center gap-2">
          <input
            value={note.title}
            onChange={(e) => update({ title: e.target.value })}
            className="flex-1 border-0 bg-transparent text-2xl font-semibold outline-none placeholder:text-muted-foreground focus:ring-0"
            placeholder="Note title"
          />
          <button
            onClick={() => update({ pinned: !note.pinned })}
            className={`rounded-lg p-2 transition cursor-pointer ${
              note.pinned
                ? "bg-[color:var(--cyan)]/15 text-[color:var(--cyan)]"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
            title={note.pinned ? "Unpin note" : "Pin note"}
            aria-label="Pin"
          >
            <Pin className="h-4 w-4" />
          </button>
          <button
            onClick={remove}
            className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition cursor-pointer"
            title="Delete note"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Metadata section */}
        <div className="flex flex-wrap items-center gap-3 text-xs border-t border-border/40 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Course:</span>
            <CourseSelect
              value={note.course ?? "none"}
              onValueChange={(v) => update({ course: v === "none" ? undefined : v })}
              triggerClassName="h-8 w-36 text-xs bg-secondary/40 border-border/60"
              options={[
                { value: "none", label: "No course" },
                ...courses.map((c) => ({ value: c.code, label: c.code })),
              ]}
            />
          </div>

          <div className="flex-1 flex items-center gap-2 min-w-[200px]">
            <span className="text-muted-foreground shrink-0">Tags:</span>
            <input
              defaultValue={note.tags?.join(", ") ?? ""}
              onBlur={(e) =>
                update({
                  tags: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder="e.g. formulas, exam, lecture (comma separated)"
              className="w-full rounded-lg border border-border/60 bg-secondary/40 px-3 py-1 text-xs outline-none focus:border-ring"
            />
          </div>

          <span className="text-muted-foreground text-[10px] sm:text-xs">
            Updated{" "}
            {new Date(note.updatedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Editor Area */}
        <div className="mt-4 min-h-[60vh]">
          <DocsEditor
            value={note.body}
            onChange={(html) => update({ body: html })}
            noteId={note.id}
            placeholder="Start writing notes… Use the toolbar for styles, lists, and tables."
          />
        </div>
      </section>
    </div>
  );
}
