import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useCourses } from "@/lib/coursesStore";
import { useExams } from "@/lib/examsStore";
import { useSemester } from "@/lib/semesterStore";
import { daysUntilDate, formatExamDateLong, isPastDate } from "@/lib/scheduleUtils";
import type { ExamEntry } from "@/lib/types";
import { GraduationCap, Plus, Trash2, Award, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CourseSelect } from "@/components/CourseSelect";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/exams")({
  component: ExamsPage,
  head: () => ({ meta: [{ title: "Exams · University Command Center" }] }),
});

function ExamsPage() {
  const { user } = useAuth();
  const { courses } = useCourses();
  const { exams, addExam, markDone, setMark, removeExam } = useExams();
  const { syncToGoogle, saveNotificationPrefs } = useSemester();

  const [courseId, setCourseId] = useState("none");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [maxMark, setMaxMark] = useState("");
  const [location, setLocation] = useState("");
  const [markDraft, setMarkDraft] = useState<Record<string, string>>({});
  const [maxDraft, setMaxDraft] = useState<Record<string, string>>({});

  const [subjectFilter, setSubjectFilter] = useState<string>("all");

  const upcoming = useMemo(
    () =>
      exams
        .filter((e) => e.status === "upcoming" && !isPastDate(e.date) && (subjectFilter === "all" || e.courseId === subjectFilter))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [exams, subjectFilter],
  );
  const completed = useMemo(
    () =>
      exams
        .filter((e) => (e.status === "done" || isPastDate(e.date)) && (subjectFilter === "all" || e.courseId === subjectFilter))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [exams, subjectFilter],
  );

  const latestExam = upcoming[0] ?? null;
  const latestCourse = latestExam ? courses.find((c) => c.id === latestExam.courseId) : undefined;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (courseId === "none" || !title.trim() || !date) {
      toast.error("Select a course, title, and exam date");
      return;
    }
    const past = isPastDate(date);
    addExam({
      courseId,
      title: title.trim(),
      date,
      maxMark: maxMark ? Number(maxMark) : undefined,
      location: location.trim() || undefined,
    });
    setTitle("");
    setDate("");
    setMaxMark("");
    setLocation("");
    toast.success(past ? "Past exam added — enter your mark below" : "Exam added");
    void syncExamsEmail();
  };

  const syncExamsEmail = async () => {
    try {
      if (user?.email) await saveNotificationPrefs({ email: user.email });
      await syncToGoogle();
    } catch {
      // silent – auto-sync failures don't interrupt the user
    }
  };

  const saveMark = (exam: ExamEntry) => {
    const raw = markDraft[exam.id] ?? (exam.mark != null ? String(exam.mark) : "");
    const mark = Number(raw);
    if (!raw || Number.isNaN(mark) || mark < 0) {
      toast.error("Enter a valid mark");
      return;
    }
    const maxRaw = maxDraft[exam.id] ?? (exam.maxMark != null ? String(exam.maxMark) : "");
    const max = maxRaw ? Number(maxRaw) : undefined;
    if (maxRaw && (Number.isNaN(max) || max! <= 0)) {
      toast.error("Enter a valid max mark");
      return;
    }
    setMark(exam.id, mark, max);
    toast.success("Mark saved");
    void syncExamsEmail();
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <header className="glass-strong relative overflow-hidden rounded-3xl p-8">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-gradient-primary opacity-30 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Exams</h1>
            <p className="text-sm text-muted-foreground">
              Schedule exams and record marks. Past dates skip straight to marking. Use Exam Prep for revision.
            </p>
          </div>

        </div>
      </header>

      {/* Subject filter bar — always visible when courses exist */}
      {courses.length > 0 && (
        <div className="glass-strong rounded-2xl px-5 py-3 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Filter by subject</span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSubjectFilter("all")}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                subjectFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
              }`}
            >
              All subjects
            </button>
            {courses.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSubjectFilter(subjectFilter === c.id ? "all" : c.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  subjectFilter === c.id
                    ? "shadow-sm"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                }`}
                style={subjectFilter === c.id ? {
                  background: `color-mix(in oklab, ${c.color} 25%, transparent)`,
                  color: c.color,
                  border: `1px solid ${c.color}55`,
                } : {}}
              >
                {c.code}
              </button>
            ))}
          </div>
        </div>
      )}

      {latestExam && (
        <section className="glass-strong relative overflow-hidden rounded-3xl border border-primary/30 p-6 md:p-8">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-primary opacity-20 blur-2xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">Latest exam</div>
              <h2 className="mt-1 text-xl font-semibold md:text-2xl">{latestExam.title}</h2>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0" />
                {formatExamDateLong(latestExam.date)}
              </p>
              {latestCourse && (
                <span
                  className="mt-2 inline-block rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wider"
                  style={{
                    background: `color-mix(in oklab, ${latestCourse.color} 20%, transparent)`,
                    color: latestCourse.color,
                  }}
                >
                  {latestCourse.code}
                </span>
              )}
            </div>
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Countdown</div>
              <div className="text-4xl font-semibold text-gradient">
                {daysUntilDate(latestExam.date)}
                <span className="ml-1 text-lg text-muted-foreground">days</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {daysUntilDate(latestExam.date) === 0 ? "Exam is today" : "Until latest exam"}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="glass-strong rounded-3xl p-6">
        <h2 className="text-lg font-semibold">Add exam</h2>
        {courses.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Add a course first, then schedule exams here.</p>
        ) : (
          <form onSubmit={handleAdd} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Course</Label>
              <CourseSelect
                value={courseId}
                onValueChange={setCourseId}
                options={[
                  { value: "none", label: "Select course" },
                  ...courses.map((c) => ({ value: c.id, label: c.code })),
                ]}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Exam title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Midterm, Final, Quiz 2…" required />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              {date && isPastDate(date) && (
                <p className="text-xs text-[color:var(--warning)]">Past date — you can add your mark right after saving.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Max mark (optional)</Label>
              <Input type="number" min={0} value={maxMark} onChange={(e) => setMaxMark(e.target.value)} placeholder="100" />
            </div>
            <div className="space-y-2">
              <Label>Location (optional)</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Room 301" />
            </div>
            <div className="flex items-end sm:col-span-2 lg:col-span-3">
              <Button type="submit" className="bg-gradient-primary text-primary-foreground shadow-glow">
                <Plus className="mr-2 h-4 w-4" /> Add exam
              </Button>
            </div>
          </form>
        )}
      </section>

      {upcoming.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Upcoming</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {upcoming.map((exam) => (
              <article key={exam.id} className="glass-strong rounded-3xl p-6">
                <ExamCardHeader exam={exam} course={courses.find((c) => c.id === exam.courseId)} onRemove={() => removeExam(exam.id)} />
                <p className="mt-3 text-sm text-[color:var(--cyan)]">
                  {formatExamDateLong(exam.date)} ·{" "}
                  {daysUntilDate(exam.date) === 0 ? "today" : `${daysUntilDate(exam.date)} day${daysUntilDate(exam.date) === 1 ? "" : "s"} left`}
                </p>
                <Button
                  type="button"
                  className="mt-4 w-full"
                  variant="secondary"
                  onClick={() => {
                    markDone(exam.id);
                    toast.success("Marked as done — add your mark in Completed");
                    void syncExamsEmail();
                  }}
                >
                  Exam finished
                </Button>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Completed {completed.length ? `(${completed.length})` : ""}
        </h2>
        {completed.length === 0 ? (
          <div className="glass-strong rounded-3xl p-8 text-center text-sm text-muted-foreground">
            No completed exams yet. Finished or past-dated exams appear here for marks.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {completed.map((exam) => (
              <article key={exam.id} className="glass-strong rounded-3xl p-6">
                <ExamCardHeader exam={exam} course={courses.find((c) => c.id === exam.courseId)} onRemove={() => removeExam(exam.id)} />
                <ExamMarkSection
                  exam={exam}
                  markDraft={markDraft}
                  maxDraft={maxDraft}
                  onMarkDraft={setMarkDraft}
                  onMaxDraft={setMaxDraft}
                  onSave={() => saveMark(exam)}
                />
              </article>
            ))}
          </div>
        )}
      </section>

      {exams.length === 0 && courses.length > 0 && (
        <div className="glass-strong rounded-3xl p-10 text-center text-sm text-muted-foreground">
          <GraduationCap className="mx-auto mb-3 h-10 w-10 opacity-40" />
          No exams yet. Add your first exam above — it appears on the Calendar too.
        </div>
      )}
    </div>
  );
}

function ExamCardHeader({
  exam,
  course,
  onRemove,
}: {
  exam: ExamEntry;
  course?: { code: string; name: string; color: string };
  onRemove: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div>
        {course && (
          <span
            className="rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wider"
            style={{
              background: `color-mix(in oklab, ${course.color} 20%, transparent)`,
              color: course.color,
            }}
          >
            {course.code}
          </span>
        )}
        <h3 className="mt-2 text-base font-semibold">{exam.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(exam.date + "T00:00:00").toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
          {exam.location ? ` · ${exam.location}` : ""}
        </p>
        {exam.maxMark != null && <p className="text-xs text-muted-foreground">Total marks: {exam.maxMark}</p>}
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        aria-label="Remove exam"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function ExamMarkSection({
  exam,
  markDraft,
  maxDraft,
  onMarkDraft,
  onMaxDraft,
  onSave,
}: {
  exam: ExamEntry;
  markDraft: Record<string, string>;
  maxDraft: Record<string, string>;
  onMarkDraft: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onMaxDraft: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onSave: () => void;
}) {
  if (exam.mark != null) {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-[color:var(--success)]/40 bg-[color:var(--success)]/10 p-4">
        <Award className="h-5 w-5 text-[color:var(--success)]" />
        <div>
          <div className="text-sm font-semibold">
            {exam.mark}
            {exam.maxMark != null ? ` / ${exam.maxMark}` : ""} marks
          </div>
          {exam.maxMark != null && (
            <div className="text-xs text-muted-foreground">{Math.round((exam.mark / exam.maxMark) * 100)}%</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3 rounded-xl border border-border/60 bg-secondary/30 p-4">
      <p className="text-xs text-muted-foreground">Enter your mark for this exam.</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Your mark</Label>
          <Input
            type="number"
            min={0}
            value={markDraft[exam.id] ?? ""}
            onChange={(e) => onMarkDraft((p) => ({ ...p, [exam.id]: e.target.value }))}
            placeholder="85"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Out of</Label>
          <Input
            type="number"
            min={0}
            value={maxDraft[exam.id] ?? (exam.maxMark != null ? String(exam.maxMark) : "")}
            onChange={(e) => onMaxDraft((p) => ({ ...p, [exam.id]: e.target.value }))}
            placeholder="100"
          />
        </div>
      </div>
      <Button type="button" size="sm" className="w-full" onClick={onSave}>
        Save mark
      </Button>
    </div>
  );
}
