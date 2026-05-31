import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useCourse, useCourses } from "@/lib/coursesStore";
import { useAssignments } from "@/lib/assignmentsStore";
import { useExams } from "@/lib/examsStore";
import { averageMarkPercent } from "@/lib/courseMarksSync";
import { ArrowLeft, Plus, X, BookOpen, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_app/courses/$courseId")({
  component: CourseDetailPage,
});

function CourseDetailPage() {
  const { courseId } = Route.useParams();
  const course = useCourse(courseId);
  const { assignments } = useAssignments();
  const { addWeakTopic, removeWeakTopic, updateCourse } = useCourses();
  const { exams } = useExams();
  const [topic, setTopic] = useState("");

  const courseExams = exams.filter((e) => e.courseId === courseId);
  const marksPercent = averageMarkPercent(exams, courseId);
  const displayMarks = course ? (marksPercent > 0 ? marksPercent : course.marks) : 0;

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

      {courseExams.length > 0 && (
        <section className="glass-strong rounded-3xl p-6">
          <h2 className="text-lg font-semibold">Exams</h2>
          <p className="text-xs text-muted-foreground">Marks saved on the Exams page sync here automatically.</p>
          <ul className="mt-4 space-y-2">
            {courseExams.map((ex) => (
              <li
                key={ex.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-secondary/30 px-4 py-3 text-sm"
              >
                <div>
                  <div className="font-medium">{ex.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(ex.date + "T00:00:00").toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {ex.status === "done" ? " · done" : " · upcoming"}
                  </div>
                </div>
                <div className="text-right font-semibold">
                  {ex.mark != null ? (
                    <>
                      {ex.mark}
                      {ex.maxMark != null ? ` / ${ex.maxMark}` : ""}
                      {ex.maxMark != null && (
                        <div className="text-xs font-normal text-muted-foreground">
                          {Math.round((ex.mark / ex.maxMark) * 100)}%
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">No mark yet</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

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
              <li key={a.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/30 px-4 py-3 text-sm">
                <span>{a.title}</span>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase text-muted-foreground">{a.status.replace("_", " ")}</span>
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
