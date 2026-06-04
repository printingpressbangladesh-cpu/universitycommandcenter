import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useAssignments } from "@/lib/assignmentsStore";
import { useCourses } from "@/lib/coursesStore";
import { useSemester } from "@/lib/semesterStore";
import type { Assignment } from "@/lib/types";
import { CourseSelect } from "@/components/CourseSelect";
import { Search, Plus, Award, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/assignments")({
  component: AssignmentsPage,
  head: () => ({ meta: [{ title: "Assignments · University Command Center" }] }),
});

const columns: { id: Assignment["status"]; title: string; tone: string }[] = [
  { id: "todo", title: "To do", tone: "var(--blue)" },
  { id: "in_progress", title: "In progress", tone: "var(--purple)" },
  { id: "done", title: "Completed", tone: "var(--success)" },
];

function AssignmentsPage() {
  const { courses } = useCourses();
  const { assignments: items, setAssignments: setItems, addAssignment, updateAssignment, removeAssignment } = useAssignments();
  const { syncToGoogle } = useSemester();
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState<string>("all");
  const [dragId, setDragId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("none");
  const [due, setDue] = useState("");
  const [priority, setPriority] = useState<Assignment["priority"]>("medium");
  const [roomNumber, setRoomNumber] = useState("");
  const [submissionType, setSubmissionType] = useState<"online" | "hard_copy">("online");

  const syncAssignmentsEmail = async () => {
    try {
      await syncToGoogle();
    } catch (err) {
      console.error("Auto-sync assignments to Google failed:", err);
    }
  };

  // Mark editing state
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [markDraft, setMarkDraft] = useState("");
  const [maxMarkDraft, setMaxMarkDraft] = useState("");

  const filtered = useMemo(() => {
    return items.filter(
      (a) =>
        (subject === "all" || a.course === subject) &&
        (a.title.toLowerCase().includes(q.toLowerCase()) || a.course.toLowerCase().includes(q.toLowerCase())),
    );
  }, [items, q, subject]);

  const onDrop = (col: Assignment["status"]) => {
    if (!dragId) return;
    setItems((prev) =>
      prev.map((x) => (x.id === dragId ? { ...x, status: col, progress: col === "done" ? 100 : x.progress } : x)),
    );
    setDragId(null);
    void syncAssignmentsEmail();
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Enter a title");
      return;
    }
    if (course === "none") {
      toast.error("Select a course");
      return;
    }
    if (!due) {
      toast.error("Pick a due date");
      return;
    }
    addAssignment({
      title: title.trim(),
      course,
      due: new Date(due + "T23:59:59").toISOString(),
      priority,
      status: "todo",
      progress: 0,
      mark: null,
      maxMark: null,
      roomNumber: roomNumber.trim() || null,
      submissionType,
    });
    setTitle("");
    setCourse("none");
    setDue("");
    setPriority("medium");
    setRoomNumber("");
    setSubmissionType("online");
    setOpen(false);
    toast.success("Assignment created");
    void syncAssignmentsEmail();
  };

  const startMarking = (a: Assignment) => {
    setMarkingId(a.id);
    setMarkDraft(a.mark != null ? String(a.mark) : "");
    setMaxMarkDraft(a.maxMark != null ? String(a.maxMark) : "");
  };

  const saveMark = (id: string) => {
    const mark = markDraft !== "" ? Number(markDraft) : null;
    const maxMark = maxMarkDraft !== "" ? Number(maxMarkDraft) : null;
    if (mark !== null && (Number.isNaN(mark) || mark < 0)) {
      toast.error("Enter a valid mark");
      return;
    }
    if (maxMark !== null && (Number.isNaN(maxMark) || maxMark <= 0)) {
      toast.error("Enter a valid max mark");
      return;
    }
    updateAssignment(id, { mark, maxMark });
    setMarkingId(null);
    toast.success("Mark saved");
    void syncAssignmentsEmail();
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Assignments</h1>
          <p className="text-sm text-muted-foreground">Drag cards across columns to update status</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="h-10 w-56 rounded-xl border border-border/60 bg-secondary/40 pl-9 pr-3 text-sm outline-none focus:border-ring"
            />
          </div>
          <CourseSelect
            value={subject}
            onValueChange={setSubject}
            triggerClassName="w-40"
            options={[
              { value: "all", label: "All subjects" },
              ...courses.map((c) => ({ value: c.code, label: c.code })),
            ]}
          />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary text-primary-foreground shadow-glow">
                <Plus className="mr-2 h-4 w-4" /> New
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-strong max-w-md rounded-3xl border-border/60">
              <DialogHeader>
                <DialogTitle>New assignment</DialogTitle>
              </DialogHeader>
              {courses.length === 0 ? (
                <p className="text-sm text-muted-foreground">Add a course first, then create assignments.</p>
              ) : (
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Lab report 2" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Course</Label>
                    <CourseSelect
                      value={course}
                      onValueChange={setCourse}
                      options={[
                        { value: "none", label: "Select course" },
                        ...courses.map((c) => ({ value: c.code, label: c.code })),
                      ]}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Due date</Label>
                      <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <CourseSelect
                        value={priority}
                        onValueChange={(v) => setPriority(v as Assignment["priority"])}
                        options={[
                          { value: "low", label: "Low" },
                          { value: "medium", label: "Medium" },
                          { value: "high", label: "High" },
                        ]}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Room number</Label>
                      <Input value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="Room 402" />
                    </div>
                    <div className="space-y-2">
                      <Label>Submission type</Label>
                      <CourseSelect
                        value={submissionType}
                        onValueChange={(v) => setSubmissionType(v as "online" | "hard_copy")}
                        options={[
                          { value: "online", label: "Online" },
                          { value: "hard_copy", label: "Hard copy" },
                        ]}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground">
                    Create assignment
                  </Button>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {columns.map((col) => (
          <div
            key={col.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(col.id)}
            className="glass-strong flex min-h-[60vh] flex-col rounded-3xl p-4"
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: col.tone }} />
                <h3 className="text-sm font-semibold">{col.title}</h3>
              </div>
              <span className="rounded-full bg-secondary/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                {filtered.filter((a) => a.status === col.id).length}
              </span>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto pr-1">
              {filtered.filter((a) => a.status === col.id).map((a) => (
                <article
                  key={a.id}
                  draggable
                  onDragStart={() => setDragId(a.id)}
                  className="cursor-grab rounded-2xl border border-border/60 bg-card/60 p-3 backdrop-blur-md transition active:cursor-grabbing hover-lift"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {a.course}
                    </span>
                    <div className="ml-auto flex items-center gap-1">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          a.priority === "high"
                            ? "bg-destructive/20 text-destructive"
                            : a.priority === "medium"
                              ? "bg-[color:var(--warning)]/20 text-[color:var(--warning)]"
                              : "bg-[color:var(--success)]/20 text-[color:var(--success)]"
                        }`}
                      >
                        {a.priority}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Are you sure you want to delete this assignment?")) {
                            removeAssignment(a.id);
                            toast.success("Assignment deleted");
                            void syncAssignmentsEmail();
                          }
                        }}
                        className="rounded-lg p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        aria-label="Delete assignment"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <h4 className="mt-2 text-sm font-medium leading-snug">{a.title}</h4>
                  {(a.roomNumber || a.submissionType) && (
                    <div className="mt-1 flex flex-wrap gap-x-2 text-[10px] text-muted-foreground">
                      {a.roomNumber && <span>Room: {a.roomNumber}</span>}
                      {a.roomNumber && a.submissionType && <span>·</span>}
                      {a.submissionType && (
                        <span>{a.submissionType === "online" ? "Online" : "Hard copy"}</span>
                      )}
                    </div>
                  )}
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-gradient-primary" style={{ width: `${a.progress}%` }} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      Due {new Date(a.due).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                    <span>{a.progress}%</span>
                  </div>

                  {/* Mark section — only on completed cards */}
                  {col.id === "done" && (
                    <div className="mt-3 border-t border-border/40 pt-3">
                      {markingId === a.id ? (
                        <div className="space-y-2">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Record mark</p>
                          <div className="grid grid-cols-2 gap-1.5">
                            <div className="space-y-0.5">
                              <Label className="text-[10px]">Mark</Label>
                              <Input
                                type="number"
                                min={0}
                                value={markDraft}
                                onChange={(e) => setMarkDraft(e.target.value)}
                                placeholder="85"
                                className="h-7 text-xs"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <Label className="text-[10px]">Out of</Label>
                              <Input
                                type="number"
                                min={0}
                                value={maxMarkDraft}
                                onChange={(e) => setMaxMarkDraft(e.target.value)}
                                placeholder="100"
                                className="h-7 text-xs"
                              />
                            </div>
                          </div>
                          <div className="flex gap-1.5">
                            <Button
                              type="button"
                              size="sm"
                              className="h-7 flex-1 text-xs bg-gradient-primary text-primary-foreground"
                              onClick={() => saveMark(a.id)}
                            >
                              Save
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs"
                              onClick={() => setMarkingId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : a.mark != null ? (
                        <div className="flex items-center justify-between rounded-lg border border-[color:var(--success)]/30 bg-[color:var(--success)]/10 px-2.5 py-2">
                          <div className="flex items-center gap-1.5">
                            <Award className="h-3.5 w-3.5 text-[color:var(--success)]" />
                            <span className="text-xs font-semibold">
                              {a.mark}{a.maxMark != null ? ` / ${a.maxMark}` : ""}
                              {a.maxMark != null && (
                                <span className="ml-1 font-normal text-muted-foreground">
                                  ({Math.round((a.mark / a.maxMark) * 100)}%)
                                </span>
                              )}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => startMarking(a)}
                            className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                          >
                            <Edit2 className="h-3 w-3" /> Edit
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startMarking(a)}
                          className="w-full rounded-lg border border-dashed border-border/60 py-1.5 text-[11px] text-muted-foreground hover:border-primary/40 hover:text-primary transition"
                        >
                          + Add mark
                        </button>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
