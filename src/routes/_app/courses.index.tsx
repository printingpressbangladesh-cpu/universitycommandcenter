import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAssignments } from "@/lib/assignmentsStore";
import { useCourses } from "@/lib/coursesStore";
import { BookOpen, AlertTriangle, ChevronRight, Plus, Pencil } from "lucide-react";
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
import { CourseSelect } from "@/components/CourseSelect";

export const Route = createFileRoute("/_app/courses/")({
  component: CoursesPage,
  head: () => ({ meta: [{ title: "Courses · University Command Center" }] }),
});

const COLORS = ["var(--blue)", "var(--purple)", "var(--cyan)", "var(--success)", "var(--warning)"];

function CoursesPage() {
  const navigate = useNavigate();
  const { courses, addCourse, updateCourse } = useCourses();
  const { assignments } = useAssignments();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editPlanned, setEditPlanned] = useState(28);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [faculty, setFaculty] = useState("");
  const [credits, setCredits] = useState(3);
  const [plannedClasses, setPlannedClasses] = useState(28);
  const [color, setColor] = useState(COLORS[0]);

  const resetForm = () => {
    setCode("");
    setName("");
    setFaculty("");
    setCredits(3);
    setPlannedClasses(28);
    setColor(COLORS[0]);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;
    addCourse({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      faculty: faculty.trim() || "TBA",
      credits,
      plannedClasses,
      color,
      weakTopics: [],
    });
    setOpen(false);
    resetForm();
  };

  const savePlanned = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || editPlanned < 1) return;
    updateCourse(editId, { plannedClasses: editPlanned });
    setEditId(null);
  };

  const totalCredits = courses.reduce((s, c) => s + c.credits, 0);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Courses</h1>
          <p className="text-sm text-muted-foreground">{courses.length} courses · {totalCredits} credits</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-primary-foreground shadow-glow">
              <Plus className="mr-2 h-4 w-4" /> Add course
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-strong max-w-md rounded-3xl border-border/60">
            <DialogHeader>
              <DialogTitle>Add a course</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Course code</Label>
                  <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="CSE311" required />
                </div>
                <div className="space-y-2">
                  <Label>Credits</Label>
                  <Input type="number" min={1} max={6} value={credits} onChange={(e) => setCredits(Number(e.target.value))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Course name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Database Systems" required />
              </div>
              <div className="space-y-2">
                <Label>Faculty</Label>
                <Input value={faculty} onChange={(e) => setFaculty(e.target.value)} placeholder="Dr. Smith" />
              </div>
              <div className="space-y-2">
                <Label>Planned classes (semester)</Label>
                <Input type="number" min={1} value={plannedClasses} onChange={(e) => setPlannedClasses(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Accent color</Label>
                <CourseSelect
                  value={color}
                  onValueChange={setColor}
                  options={COLORS.map((c, i) => ({ value: c, label: `Color ${i + 1}` }))}
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground">Save course</Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <Dialog open={!!editId} onOpenChange={(o) => !o && setEditId(null)}>
        <DialogContent className="glass-strong max-w-sm rounded-3xl border-border/60">
          <DialogHeader>
            <DialogTitle>Edit planned classes</DialogTitle>
          </DialogHeader>
          <form onSubmit={savePlanned} className="space-y-4">
            <div className="space-y-2">
              <Label>Total classes you expect this semester</Label>
              <Input type="number" min={1} value={editPlanned} onChange={(e) => setEditPlanned(Number(e.target.value))} required />
            </div>
            <Button type="submit" className="w-full">Save</Button>
          </form>
        </DialogContent>
      </Dialog>

      {courses.length === 0 ? (
        <div className="glass-strong rounded-3xl p-12 text-center">
          <p className="text-sm text-muted-foreground">No courses yet. Use Add course to get started.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((c) => {
            const tasks = assignments.filter((a) => a.course === c.code && a.status !== "done");
            return (
              <article key={c.id} className="glass-strong group relative overflow-hidden rounded-3xl p-6 hover-lift">
                <div
                  className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-25 blur-3xl"
                  style={{ background: c.color }}
                />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span
                      className="rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wider"
                      style={{
                        background: `color-mix(in oklab, ${c.color} 20%, transparent)`,
                        color: c.color,
                      }}
                    >
                      {c.code}
                    </span>
                    <span className="text-xs text-muted-foreground">{c.credits} credits</span>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold">{c.name}</h2>
                  <p className="text-xs text-muted-foreground">{c.faculty}</p>

                  <div className="mt-5 text-sm">
                    <Metric label="Attendance" value={`${c.attendance}%`} tone={c.attendance < 75 ? "warn" : "ok"} />
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-xl border border-border/60 bg-secondary/30 px-3 py-2 text-xs">
                    <span className="text-muted-foreground">
                      Planned: <strong className="text-foreground">{c.plannedClasses}</strong> · Logged: {c.totalClasses}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditId(c.id);
                        setEditPlanned(c.plannedClasses);
                      }}
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </button>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Course progress</span>
                      <span>{c.progress}%</span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full"
                        style={{
                          width: `${c.progress}%`,
                          background: `linear-gradient(90deg, ${c.color}, var(--accent))`,
                        }}
                      />
                    </div>
                  </div>

                  {c.weakTopics.length > 0 && (
                    <div className="mt-4 rounded-xl border border-border/60 bg-secondary/30 p-3">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-[color:var(--warning)]">
                        <AlertTriangle className="h-3.5 w-3.5" /> Weak topics
                      </div>
                      <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                        {c.weakTopics.map((t) => (
                          <li key={t}>• {t}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="relative z-10 mt-4 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <BookOpen className="h-3.5 w-3.5" /> {tasks.length} upcoming
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate({ to: "/courses/$courseId", params: { courseId: c.id } })}
                      className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                      Open <ChevronRight className="h-3.5 w-3.5" />
                    </button>
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

function Metric({ label, value, tone }: { label: string; value: string; tone?: "ok" | "warn" }) {
  return (
    <div className="rounded-xl border border-border/60 bg-secondary/30 p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-lg font-semibold ${tone === "warn" ? "text-[color:var(--warning)]" : ""}`}>{value}</div>
    </div>
  );
}
