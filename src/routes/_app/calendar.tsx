import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useAssignments } from "@/lib/assignmentsStore";
import { useRoutine } from "@/lib/routineStore";
import { useSemester } from "@/lib/semesterStore";
import { useCourses } from "@/lib/coursesStore";
import { useExams } from "@/lib/examsStore";
import {
  expandRoutineDates,
  dateKey,
  parseDateKey,
} from "@/lib/scheduleUtils";
import type { CalendarEvent } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_app/calendar")({
  component: CalendarPage,
  head: () => ({ meta: [{ title: "Calendar · University Command Center" }] }),
});

function CalendarPage() {
  const { assignments } = useAssignments();
  const { blocks } = useRoutine();
  const { semester, holidays } = useSemester();
  const { courses } = useCourses();
  const { exams } = useExams();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const monthStart = useMemo(
    () => new Date(cursor.getFullYear(), cursor.getMonth(), 1),
    [cursor],
  );
  const monthEnd = useMemo(
    () => new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0),
    [cursor],
  );

  const events = useMemo(() => {
    const list: CalendarEvent[] = [];

    for (const { date, block } of expandRoutineDates(blocks, semester, holidays, monthStart, monthEnd)) {
      const c = courses.find((x) => x.id === block.courseId);
      list.push({
        id: `r-${block.id}-${date}`,
        date: parseDateKey(date),
        title: block.title,
        subtitle: c ? c.code : block.start,
        color: c?.color ?? "var(--cyan)",
        kind: block.isClass !== false && block.courseId ? "class" : "other",
      });
    }

    for (const a of assignments) {
      if (a.status === "done") continue;
      const d = new Date(a.due);
      if (d >= monthStart && d <= monthEnd) {
        const c = courses.find((x) => x.code === a.course);
        list.push({
          id: `a-${a.id}`,
          date: d,
          title: a.title,
          subtitle: `Due · ${a.course}`,
          color:
            a.priority === "high"
              ? "var(--destructive)"
              : a.priority === "medium"
                ? "var(--warning)"
                : "var(--success)",
          kind: "assignment",
        });
      }
    }

    for (const ex of exams) {
      const c = courses.find((x) => x.id === ex.courseId);
      const d = parseDateKey(ex.date);
      if (d >= monthStart && d <= monthEnd) {
        list.push({
          id: `e-${ex.id}`,
          date: d,
          title: ex.title,
          subtitle: c ? `${c.code}${ex.status === "done" ? " · done" : ""}` : ex.status,
          color: "var(--purple)",
          kind: "exam",
        });
      }
    }

    for (const h of holidays) {
      const start = parseDateKey(h.startDate);
      const end = parseDateKey(h.endDate ?? h.startDate);
      const cur = new Date(start);
      while (cur <= end) {
        if (cur >= monthStart && cur <= monthEnd) {
          list.push({
            id: `h-${h.id}-${dateKey(cur)}`,
            date: new Date(cur),
            title: h.label,
            subtitle: "Holiday",
            color: "var(--muted-foreground)",
            kind: "holiday",
          });
        }
        cur.setDate(cur.getDate() + 1);
      }
    }

    return list;
  }, [blocks, semester, holidays, assignments, courses, exams, monthStart, monthEnd]);

  const grid = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const startDow = first.getDay();
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const cells: { date: Date | null }[] = [];
    for (let i = 0; i < startDow; i++) cells.push({ date: null });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ date: new Date(cursor.getFullYear(), cursor.getMonth(), d) });
    while (cells.length % 7 !== 0) cells.push({ date: null });
    return cells;
  }, [cursor]);

  const monthLabel = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });
  const today = new Date();

  return (
    <div className="space-y-6 animate-fade-in-up">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground">
            Routine classes, assignment deadlines, exams & holidays — updated from your routine.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="grid h-9 w-9 place-items-center rounded-xl border border-border/60 hover:bg-secondary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="w-44 text-center text-base font-semibold">{monthLabel}</div>
          <button
            type="button"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="grid h-9 w-9 place-items-center rounded-xl border border-border/60 hover:bg-secondary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--cyan)]" /> Class</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--warning)]" /> Deadline</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--purple)]" /> Exam</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-muted-foreground" /> Holiday</span>
      </div>

      <div className="glass-strong overflow-hidden rounded-3xl p-4">
        <div className="grid grid-cols-7 border-b border-border/60 pb-2 text-center text-xs uppercase tracking-wider text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {grid.map((cell, i) => {
            if (!cell.date) return <div key={i} className="min-h-[88px] rounded-xl bg-transparent" />;
            const isToday = cell.date.toDateString() === today.toDateString();
            const key = dateKey(cell.date);
            const cellEvents = events.filter((e) => dateKey(e.date) === key);
            return (
              <div
                key={i}
                className={`min-h-[88px] rounded-xl border p-1.5 text-left text-xs transition ${
                  isToday ? "border-primary bg-primary/10" : "border-border/60 bg-secondary/20 hover:bg-secondary/40"
                }`}
              >
                <div className={`text-xs font-medium ${isToday ? "text-primary" : ""}`}>{cell.date.getDate()}</div>
                <div className="mt-1 space-y-0.5">
                  {cellEvents.slice(0, 3).map((e) => (
                    <div
                      key={e.id}
                      className="truncate rounded px-1 py-0.5 text-[10px]"
                      style={{
                        background: `color-mix(in oklab, ${e.color} 25%, transparent)`,
                        color: e.color,
                      }}
                      title={e.title}
                    >
                      {e.subtitle ? `${e.subtitle}` : e.title}
                    </div>
                  ))}
                  {cellEvents.length > 3 && (
                    <div className="text-[10px] text-muted-foreground">+{cellEvents.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
