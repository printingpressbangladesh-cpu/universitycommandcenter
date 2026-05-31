import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useCourses } from "@/lib/coursesStore";
import { useRoutine } from "@/lib/routineStore";
import { useSemester } from "@/lib/semesterStore";
import {
  classBlocksForDate,
  isHoliday,
  isWithinSemester,
  parseDateKey,
  todayKey,
} from "@/lib/scheduleUtils";
import { AlertTriangle, Ban, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/attendance")({
  component: AttendancePage,
  head: () => ({ meta: [{ title: "Attendance · University Command Center" }] }),
});

const MIN = 70;

function AttendancePage() {
  const { courses } = useCourses();
  const { blocks } = useRoutine();
  const { semester, holidays, recordClassAttendance, cancelClass, getLogForSession } = useSemester();
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [excuse, setExcuse] = useState("");

  const dateObj = parseDateKey(selectedDate);
  const isToday = selectedDate === todayKey();
  const inSemester = isWithinSemester(selectedDate, semester);
  const holiday = isHoliday(selectedDate, holidays);

  const scheduled = useMemo(() => {
    if (!inSemester || holiday) return [];
    return classBlocksForDate(blocks, dateObj)
      .map((block) => {
        const course = courses.find((c) => c.id === block.courseId);
        if (!course) return null;
        return { block, course };
      })
      .filter(Boolean) as { block: (typeof blocks)[0]; course: (typeof courses)[0] }[];
  }, [blocks, courses, dateObj, inSemester, holiday]);

  const mark = (courseId: string, routineBlockId: string, present: boolean) => {
    const result = recordClassAttendance({
      courseId,
      routineBlockId,
      date: selectedDate,
      present,
      excuse: isToday ? undefined : excuse,
    });
    if (!result.ok) {
      toast.error(result.error ?? "Could not save");
      return;
    }
    toast.success(present ? "Marked present" : "Marked absent");
    if (!isToday) setExcuse("");
  };

  const markCancelled = (courseId: string, routineBlockId: string) => {
    const result = cancelClass({
      courseId,
      routineBlockId,
      date: selectedDate,
      excuse: isToday ? undefined : excuse,
    });
    if (!result.ok) {
      toast.error(result.error ?? "Could not save");
      return;
    }
    toast.success("Class marked as cancelled — won't affect your attendance %");
    if (!isToday) setExcuse("");
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Attendance</h1>
        <p className="text-sm text-muted-foreground">
          Mark present/absent for scheduled classes. If the professor cancelled class, use Class cancelled.
        </p>
      </header>

      <section className="glass-strong rounded-3xl p-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-44" />
          </div>
          {!isToday && (
            <div className="min-w-[240px] flex-1 space-y-2">
              <Label>Reason (required for past/future days)</Label>
              <Textarea
                value={excuse}
                onChange={(e) => setExcuse(e.target.value)}
                placeholder="e.g. Medical leave, university event…"
                rows={2}
              />
            </div>
          )}
        </div>
        {holiday && (
          <p className="mt-3 text-sm text-[color:var(--warning)]">This day is marked as a holiday — no classes scheduled.</p>
        )}
        {!inSemester && semester && (
          <p className="mt-3 text-sm text-[color:var(--warning)]">This date is outside your semester period.</p>
        )}
      </section>

      {scheduled.length === 0 ? (
        <div className="glass-strong rounded-3xl p-10 text-center text-sm text-muted-foreground">
          {holiday || !inSemester
            ? "No attendance to record for this date."
            : "No classes on your routine for this day. Add class blocks in Routine (linked to a course)."}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {scheduled.map(({ block, course }) => {
            const log = getLogForSession(course.id, selectedDate, block.id);
            const cancelled = !!log?.cancelled;
            const danger = course.attendance < MIN;
            const displayName = course.name;

            return (
              <article
                key={`${block.id}-${selectedDate}`}
                className={`glass-strong rounded-3xl p-6 hover-lift ${cancelled ? "opacity-75" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span
                      className="rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wider"
                      style={{
                        background: `color-mix(in oklab, ${course.color} 20%, transparent)`,
                        color: course.color,
                      }}
                    >
                      {course.code}
                    </span>
                    <h2 className="mt-2 text-base font-semibold">{displayName}</h2>
                    <p className="text-xs text-muted-foreground">
                      {block.start}–{block.end}
                      {block.location ? ` · ${block.location}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Logged: {course.attended}/{course.totalClasses} ({course.attendance}%) · Planned: {course.plannedClasses}
                    </p>
                  </div>
                  {cancelled ? (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                      Cancelled
                    </span>
                  ) : log ? (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
                        log.present
                          ? "bg-[color:var(--success)]/20 text-[color:var(--success)]"
                          : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {log.present ? "Present" : "Absent"}
                    </span>
                  ) : null}
                </div>

                {!cancelled && (
                  <>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 gap-1.5 border-[color:var(--success)]/40 text-[color:var(--success)] hover:bg-[color:var(--success)]/10"
                        onClick={() => mark(course.id, block.id, true)}
                      >
                        <UserCheck className="h-4 w-4" /> Present
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 gap-1.5"
                        onClick={() => mark(course.id, block.id, false)}
                      >
                        <UserX className="h-4 w-4" /> Absent
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="mt-2 w-full gap-1.5 text-xs text-muted-foreground"
                      onClick={() => markCancelled(course.id, block.id)}
                    >
                      <Ban className="h-3.5 w-3.5" /> Class cancelled by professor
                    </Button>
                  </>
                )}

                {log?.excuse && (
                  <p className="mt-2 text-xs text-muted-foreground">Note: {log.excuse}</p>
                )}

                {danger && !cancelled && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                    <AlertTriangle className="h-4 w-4 shrink-0" /> Below {MIN}% overall
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {courses.length > 0 && scheduled.length === 0 && isToday && (
        <section className="glass-strong rounded-3xl p-6">
          <h2 className="text-sm font-semibold text-muted-foreground">Course overview</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <div key={c.id} className="rounded-xl border border-border/60 bg-secondary/30 p-3 text-sm">
                <div className="font-medium">{c.code}</div>
                <div className="text-xs text-muted-foreground">
                  {c.attendance}% · {c.attended}/{c.totalClasses} logged · {c.plannedClasses} planned
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
