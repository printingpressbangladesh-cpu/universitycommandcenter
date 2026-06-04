import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useCourse, useCourses } from "@/lib/coursesStore";
import { useAssignments } from "@/lib/assignmentsStore";
import { useExams } from "@/lib/examsStore";
import { averageMarkPercent } from "@/lib/courseMarksSync";
import { ArrowLeft, Plus, X, BookOpen, ClipboardList, Award, Trash2, Calendar, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { isPastDate, daysUntilDate } from "@/lib/scheduleUtils";
import type { ExamEntry } from "@/lib/types";

export const Route = createFileRoute("/_app/courses/$courseId")({
  component: CourseDetailPage,
});

function CourseDetailPage() {
  const { courseId } = Route.useParams();
  const course = useCourse(courseId);
  const { assignments } = useAssignments();
  const { addWeakTopic, removeWeakTopic, updateCourse } = useCourses();
  const { exams, addExam, markDone, setMark, removeExam } = useExams();
  const [topic, setTopic] = useState("");

  const [isAddingExam, setIsAddingExam] = useState(false);
  const [examTitle, setExamTitle] = useState("");
  const [examDate, setExamDate] = useState("");
  const [examMaxMark, setExamMaxMark] = useState("");
  const [examLocation, setExamLocation] = useState("");

  const [markDraft, setMarkDraft] = useState<Record<string, string>>({});
  const [maxDraft, setMaxDraft] = useState<Record<string, string>>({});
  const [editingMarkId, setEditingMarkId] = useState<string | null>(null);

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim() || !examDate) {
      toast.error("Enter a title and date");
      return;
    }
    const past = isPastDate(examDate);
    addExam({
      courseId,
      title: examTitle.trim(),
      date: examDate,
      maxMark: examMaxMark ? Number(examMaxMark) : undefined,
      location: examLocation.trim() || undefined,
    });
    setExamTitle("");
    setExamDate("");
    setExamMaxMark("");
    setExamLocation("");
    setIsAddingExam(false);
    toast.success(past ? "Past exam added — enter your mark below" : "Exam added");
  };

  const startEditingMark = (ex: ExamEntry) => {
    setEditingMarkId(ex.id);
    setMarkDraft((prev) => ({ ...prev, [ex.id]: String(ex.mark ?? "") }));
    setMaxDraft((prev) => ({ ...prev, [ex.id]: String(ex.maxMark ?? "") }));
  };

  const saveMark = (examId: string, currentMax?: number) => {
    const raw = markDraft[examId];
    const mark = Number(raw);
    if (raw === undefined || raw === "" || Number.isNaN(mark) || mark < 0) {
      toast.error("Enter a valid mark");
      return;
    }
    const maxRaw = maxDraft[examId] ?? (currentMax != null ? String(currentMax) : "");
    const max = maxRaw ? Number(maxRaw) : undefined;
    if (maxRaw && (Number.isNaN(max) || max! <= 0)) {
      toast.error("Enter a valid max mark");
      return;
    }
    setMark(examId, mark, max);
    setEditingMarkId(null);
    toast.success("Mark saved");
  };

  const courseExams = exams.filter((e) => e.courseId === courseId);
  const marksPercent = averageMarkPercent(exams, courseId);
  const displayMarks = course ? (marksPercent !== null && marksPercent > 0 ? marksPercent : course.marks) : 0;

  if (!course) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Course not found.</p>
        <Link to="/courses" className="text-primary hover:underline">← Back to courses</Link>
      </div>
    );
  }

  const tasks = assignments.filter((a) => a.course === course.code);
  const pending = tasks.filter((a) => a.status !== "done");

  const addTopic = (e: React.FormEvent) => {
    e.preventDefault();
    addWeakTopic(course.id, topic);
    setTopic("");
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Link to="/courses" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All courses
      </Link>

      <header className="glass-strong rounded-3xl p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wider" style={{ background: `color-mix(in oklab, ${course.color} 20%, transparent)`, color: course.color }}>
              {course.code}
            </span>
            <h1 className="mt-2 text-2xl font-semibold">{course.name}</h1>
            <p className="text-sm text-muted-foreground">{course.faculty} · {course.credits} credits</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Attendance" value={`${course.attendance}%`} />
            <Stat label="Marks" value={displayMarks > 0 ? `${displayMarks}%` : "—"} />
            <Stat label="Attended" value={`${course.attended}/${course.totalClasses}`} />
            <Stat label="Progress" value={`${course.progress}%`} />
          </div>
        </div>
        <PlannedClassesEditor courseId={course.id} planned={course.plannedClasses} onSave={(n) => updateCourse(course.id, { plannedClasses: n })} />
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground"><span>Course progress</span><span>{course.progress}%</span></div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full" style={{ width: `${course.progress}%`, background: `linear-gradient(90deg, ${course.color}, var(--accent))` }} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Label className="sr-only">Progress</Label>
          <input
            type="range"
            min={0}
            max={100}
            value={course.progress}
            onChange={(e) => updateCourse(course.id, { progress: Number(e.target.value) })}
            className="w-full max-w-xs"
          />
          <span className="text-xs text-muted-foreground">Drag to update progress</span>
        </div>
      </header>

      <section className="glass-strong rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Exams ({courseExams.length})</h2>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setIsAddingExam(!isAddingExam)}
            className="gap-1 border-primary/30 text-primary hover:bg-primary/10"
          >
            {isAddingExam ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isAddingExam ? "Cancel" : "Add Exam"}
          </Button>
        </div>

        {isAddingExam && (
          <form onSubmit={handleAddExam} className="rounded-xl border border-border/60 bg-secondary/20 p-4 space-y-3 animate-fade-in-up">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">New Exam</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Exam Title</Label>
                <Input
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="Midterm, Quiz 1, etc."
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Date</Label>
                <Input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Max Mark (optional)</Label>
                <Input
                  type="number"
                  min={0}
                  value={examMaxMark}
                  onChange={(e) => setExamMaxMark(e.target.value)}
                  placeholder="100"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Location (optional)</Label>
                <Input
                  value={examLocation}
                  onChange={(e) => setExamLocation(e.target.value)}
                  placeholder="Room 102"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="submit" size="sm" className="bg-gradient-primary text-primary-foreground">
                Save Exam
              </Button>
            </div>
          </form>
        )}

        {courseExams.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No exams scheduled for this course yet.</p>
        ) : (
          <ul className="space-y-2">
            {courseExams.map((ex) => {
              const isEditing = editingMarkId === ex.id;
              const hasMark = ex.mark != null;
              const isPast = isPastDate(ex.date) || ex.status === "done";

              return (
                <li
                  key={ex.id}
                  className="rounded-xl border border-border/60 bg-secondary/30 px-4 py-3 text-sm flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {ex.title}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider ${
                            ex.status === "done"
                              ? "bg-[color:var(--success)]/15 text-[color:var(--success)]"
                              : "bg-[color:var(--cyan)]/15 text-[color:var(--cyan)]"
                          }`}
                        >
                          {ex.status === "done" ? "completed" : `upcoming (${daysUntilDate(ex.date)}d left)`}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(ex.date + "T00:00:00").toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {ex.location ? ` · ${ex.location}` : ""}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => removeExam(ex.id)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
                        aria-label="Remove exam"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Mark recording / status block */}
                  <div className="border-t border-border/40 pt-3">
                    {isEditing ? (
                      <div className="space-y-2 bg-secondary/20 rounded-lg p-3 border border-border/40">
                        <p className="text-xs font-semibold text-primary">Edit Graded Marks</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[10px]">Your mark</Label>
                            <Input
                              type="number"
                              min={0}
                              value={markDraft[ex.id] ?? ""}
                              onChange={(e) => setMarkDraft((p) => ({ ...p, [ex.id]: e.target.value }))}
                              placeholder="85"
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">Out of</Label>
                            <Input
                              type="number"
                              min={0}
                              value={maxDraft[ex.id] ?? ""}
                              onChange={(e) => setMaxDraft((p) => ({ ...p, [ex.id]: e.target.value }))}
                              placeholder="100"
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-1.5 pt-1">
                          <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingMarkId(null)}>
                            Cancel
                          </Button>
                          <Button type="button" size="sm" className="h-7 text-xs bg-gradient-primary text-primary-foreground" onClick={() => saveMark(ex.id, ex.maxMark)}>
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : hasMark ? (
                      <div className="flex items-center justify-between rounded-lg border border-[color:var(--success)]/40 bg-[color:var(--success)]/10 p-3">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-[color:var(--success)]" />
                          <div>
                            <div className="text-xs font-semibold">
                              {ex.mark}
                              {ex.maxMark != null ? ` / ${ex.maxMark}` : ""} marks
                            </div>
                            {ex.maxMark != null && (
                              <div className="text-[10px] text-muted-foreground">
                                {Math.round((ex.mark! / ex.maxMark) * 100)}% score
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1 text-xs text-primary hover:bg-primary/10"
                          onClick={() => startEditingMark(ex)}
                        >
                          <Edit2 className="h-3 w-3" /> Edit
                        </Button>
                      </div>
                    ) : isPast ? (
                      <div className="space-y-2 bg-secondary/20 rounded-lg p-3 border border-border/40">
                        <p className="text-xs font-medium text-muted-foreground">Record your exam mark below:</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[10px]">Your mark</Label>
                            <Input
                              type="number"
                              min={0}
                              value={markDraft[ex.id] ?? ""}
                              onChange={(e) => setMarkDraft((p) => ({ ...p, [ex.id]: e.target.value }))}
                              placeholder="85"
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">Out of</Label>
                            <Input
                              type="number"
                              min={0}
                              value={maxDraft[ex.id] ?? (ex.maxMark != null ? String(ex.maxMark) : "")}
                              onChange={(e) => setMaxDraft((p) => ({ ...p, [ex.id]: e.target.value }))}
                              placeholder="100"
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                        <Button type="button" size="sm" className="w-full h-8 text-xs bg-gradient-primary text-primary-foreground mt-1" onClick={() => saveMark(ex.id, ex.maxMark)}>
                          Save mark
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center bg-secondary/10 p-2.5 rounded-lg border border-border/40">
                        <span className="text-xs text-muted-foreground">Upcoming exam schedule.</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="h-7 text-xs px-2.5"
                          onClick={() => {
                            markDone(ex.id);
                            toast.success("Exam finished! You can enter marks now.");
                          }}
                        >
                          Exam finished
                        </Button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="glass-strong rounded-3xl p-6">
        <h2 className="text-lg font-semibold">Weak topics</h2>
        <p className="text-xs text-muted-foreground">Topics you want extra revision on for this course.</p>
        <form onSubmit={addTopic} className="mt-4 flex gap-2">
          <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Normalization, Deadlocks…" className="flex-1" />
          <Button type="submit" size="sm" className="bg-gradient-primary text-primary-foreground">
            <Plus className="h-4 w-4" />
          </Button>
        </form>
        {course.weakTopics.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {course.weakTopics.map((t) => (
              <li key={t} className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/30 px-3 py-2 text-sm">
                <span>{t}</span>
                <button type="button" onClick={() => removeWeakTopic(course.id, t)} className="rounded-lg p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Remove">
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">No weak topics yet — add any you want to focus on.</p>
        )}
      </section>

      <section className="glass-strong rounded-3xl p-6">
        <div className="mb-4 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Assignments ({pending.length} pending)</h2>
        </div>
        <ul className="space-y-2">
          {tasks.length === 0 ? (
            <li className="text-sm text-muted-foreground">No assignments linked to this course yet.</li>
          ) : (
            tasks.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-secondary/30 px-4 py-3 text-sm">
                <div className="min-w-0 flex-1">
                  <span className="font-medium">{a.title}</span>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    Due {new Date(a.due).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {a.mark != null && (
                    <div className="flex items-center gap-1 rounded-lg border border-[color:var(--success)]/30 bg-[color:var(--success)]/10 px-2 py-1">
                      <Award className="h-3 w-3 text-[color:var(--success)]" />
                      <span className="text-xs font-semibold text-[color:var(--success)]">
                        {a.mark}{a.maxMark != null ? ` / ${a.maxMark}` : ""}
                        {a.maxMark != null && (
                          <span className="font-normal text-muted-foreground ml-1">
                            ({Math.round((a.mark / a.maxMark) * 100)}%)
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase text-muted-foreground">{a.status.replace("_", " ")}</span>
                </div>
              </li>
            ))
          )}
        </ul>
        <Link to="/assignments" className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <BookOpen className="h-4 w-4" /> View all assignments
        </Link>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-secondary/30 px-4 py-3 text-center">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function PlannedClassesEditor({
  courseId,
  planned,
  onSave,
}: {
  courseId: string;
  planned: number;
  onSave: (n: number) => void;
}) {
  const [value, setValue] = useState(String(planned));
  const [editing, setEditing] = useState(false);

  return (
    <div className="mt-4 rounded-xl border border-border/60 bg-secondary/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm font-medium">Planned classes (semester)</div>
          <p className="text-xs text-muted-foreground">Total classes you expect this term — edit anytime.</p>
        </div>
        {!editing ? (
          <Button type="button" size="sm" variant="secondary" onClick={() => setEditing(true)}>
            Edit ({planned})
          </Button>
        ) : null}
      </div>
      {editing && (
        <form
          className="mt-3 flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const n = Number(value);
            if (n < 1) return;
            onSave(n);
            setEditing(false);
          }}
        >
          <div className="space-y-1">
            <Label htmlFor={`planned-${courseId}`} className="text-xs">
              Number of classes
            </Label>
            <Input
              id={`planned-${courseId}`}
              type="number"
              min={1}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-28"
            />
          </div>
          <Button type="submit" size="sm">Save</Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => { setValue(String(planned)); setEditing(false); }}>
            Cancel
          </Button>
        </form>
      )}
    </div>
  );
}
