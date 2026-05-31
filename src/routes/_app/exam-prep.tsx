import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useCourses } from "@/lib/coursesStore";
import { useExams } from "@/lib/examsStore";
import {
  deleteChecklistItem,
  listExamChecklist,
  upsertChecklistItem,
} from "@/lib/supabase/data";
import { daysUntilDate, isPastDate } from "@/lib/scheduleUtils";
import type { ExamChecklistItem } from "@/lib/types";
import { Check, Plus, Trash2, ListChecks } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/exam-prep")({
  component: ExamPrepPage,
  head: () => ({ meta: [{ title: "Exam Prep · University Command Center" }] }),
});

function ExamPrepPage() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const { courses } = useCourses();
  const { exams } = useExams();
  const [items, setItems] = useState<ExamChecklistItem[]>([]);
  const [taskDraft, setTaskDraft] = useState<Record<string, string>>({});

  const loadChecklist = useCallback(async () => {
    if (!userId) return;
    const rows = await listExamChecklist(userId);
    setItems(rows);
  }, [userId]);

  useEffect(() => {
    void loadChecklist();
  }, [loadChecklist]);

  const upcomingExams = useMemo(
    () => exams.filter((e) => e.status === "upcoming" && !isPastDate(e.date)),
    [exams],
  );

  const nearestExam = useMemo(() => {
    if (upcomingExams.length === 0) return null;
    return [...upcomingExams].sort((a, b) => a.date.localeCompare(b.date))[0];
  }, [upcomingExams]);

  const overall = useMemo(() => {
    if (items.length === 0) return 0;
    return Math.round((items.filter((i) => i.done).length / items.length) * 100);
  }, [items]);

  const toggleChecklist = async (item: ExamChecklistItem) => {
    const next = { ...item, done: !item.done };
    setItems((p) => p.map((x) => (x.id === item.id ? next : x)));
    if (userId) await upsertChecklistItem(userId, next);
  };

  const addChecklistItem = async (cid: string) => {
    const text = (taskDraft[cid] ?? "").trim();
    if (!text || !userId) return;
    const item: ExamChecklistItem = {
      id: crypto.randomUUID(),
      courseId: cid,
      userId,
      text,
      done: false,
    };
    setItems((p) => [...p, item]);
    setTaskDraft((p) => ({ ...p, [cid]: "" }));
    if (userId) await upsertChecklistItem(userId, item);
  };

  const removeItem = async (id: string) => {
    setItems((p) => p.filter((x) => x.id !== id));
    await deleteChecklistItem(id);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <header className="glass-strong relative overflow-hidden rounded-3xl p-8">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-gradient-primary opacity-30 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Exam Prep</h1>
            <p className="text-sm text-muted-foreground">
              Revision checklists and readiness — add exams and marks on the Exams page.
            </p>
          </div>
          <div className="flex items-end gap-6">
            {nearestExam && (
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Next exam</div>
                <div className="text-2xl font-semibold text-gradient">
                  {daysUntilDate(nearestExam.date)}{" "}
                  <span className="text-base text-muted-foreground">days</span>
                </div>
                <div className="text-xs text-muted-foreground">{nearestExam.title}</div>
              </div>
            )}
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Readiness</div>
              <div className="text-2xl font-semibold">{items.length ? `${overall}%` : "—"}</div>
              {items.length > 0 && (
                <div className="mt-1 h-2 w-32 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-gradient-primary" style={{ width: `${overall}%` }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {courses.length === 0 ? (
        <div className="glass-strong rounded-3xl p-12 text-center text-sm text-muted-foreground">
          Add courses first, then build revision lists per subject.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((c) => {
            const courseItems = items.filter((i) => i.courseId === c.id);
            const checked = courseItems.filter((i) => i.done).length;
            const nextExam = upcomingExams.find((e) => e.courseId === c.id);
            const courseDays = nextExam ? daysUntilDate(nextExam.date) : null;

            return (
              <article key={c.id} className="glass-strong rounded-3xl p-6">
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
                  <ListChecks className="h-5 w-5 text-muted-foreground" />
                </div>
                <h2 className="mt-2 text-base font-semibold">{c.name}</h2>
                {courseDays !== null && nextExam && (
                  <p className="mt-1 text-xs text-[color:var(--cyan)]">
                    {nextExam.title}: {courseDays} day{courseDays === 1 ? "" : "s"} left
                  </p>
                )}

                {courseItems.length > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Revision</span>
                      <span>
                        {checked}/{courseItems.length}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full" style={{ width: `${(checked / courseItems.length) * 100}%`, background: c.color }} />
                    </div>
                  </div>
                )}

                <form
                  className="mt-4 flex gap-2"
                  onSubmit={(ev) => {
                    ev.preventDefault();
                    void addChecklistItem(c.id);
                  }}
                >
                  <Input
                    value={taskDraft[c.id] ?? ""}
                    onChange={(e) => setTaskDraft((p) => ({ ...p, [c.id]: e.target.value }))}
                    placeholder="Add revision task…"
                    className="h-9 flex-1 text-sm"
                  />
                  <Button type="submit" size="sm" variant="secondary" className="h-9 px-2">
                    <Plus className="h-4 w-4" />
                  </Button>
                </form>

                <ul className="mt-3 space-y-2">
                  {courseItems.length === 0 ? (
                    <li className="text-xs text-muted-foreground">No tasks yet.</li>
                  ) : (
                    courseItems.map((it) => (
                      <li key={it.id} className="flex items-center gap-1">
                        <button type="button" onClick={() => void toggleChecklist(it)} className="shrink-0">
                          <span
                            className={`grid h-5 w-5 place-items-center rounded-md border ${it.done ? "border-transparent bg-gradient-primary" : "border-border bg-transparent"}`}
                          >
                            {it.done && <Check className="h-3 w-3 text-primary-foreground" />}
                          </span>
                        </button>
                        <span className={`flex-1 text-sm ${it.done ? "line-through text-muted-foreground" : ""}`}>{it.text}</span>
                        <button
                          type="button"
                          onClick={() => void removeItem(it.id)}
                          className="rounded-lg p-1 text-muted-foreground hover:text-destructive"
                          aria-label="Remove task"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))
                  )}
                </ul>

                {c.weakTopics.length > 0 && (
                  <div className="mt-4 rounded-xl border border-[color:var(--warning)]/30 bg-[color:var(--warning)]/5 p-3 text-xs">
                    <div className="font-medium text-[color:var(--warning)]">Focus on weak topics</div>
                    <ul className="mt-1 space-y-0.5 text-muted-foreground">
                      {c.weakTopics.map((t) => (
                        <li key={t}>• {t}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
