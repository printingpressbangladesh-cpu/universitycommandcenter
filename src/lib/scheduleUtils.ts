import type { Holiday, RoutineBlock, SemesterPeriod, Weekday } from "@/lib/types";

export const ROUTINE_DAYS: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const JS_TO_WEEKDAY: Weekday[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function dateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDateKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey() {
  return dateKey(new Date());
}

/** True when exam/attendance date is strictly before today. */
export function isPastDate(dateKeyStr: string) {
  return dateKeyStr < todayKey();
}

export function daysUntilDate(dateKeyStr: string) {
  if (isPastDate(dateKeyStr)) return 0;
  const today = parseDateKey(todayKey());
  const target = parseDateKey(dateKeyStr);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** e.g. "Saturday, 1st June 2026" */
/** Monday of the current week (YYYY-MM-DD). */
export function weekStartKey() {
  const d = new Date();
  const day = d.getDay();
  const diff = (day + 1) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return dateKey(d);
}

export function formatStudyMinutes(totalMinutes: number) {
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const h = totalMinutes / 60;
  return h < 10 ? `${h.toFixed(1)}h` : `${Math.round(h)}h`;
}

export function formatExamDateLong(dateKeyStr: string) {
  const d = parseDateKey(dateKeyStr);
  const weekday = d.toLocaleDateString(undefined, { weekday: "long" });
  const month = d.toLocaleDateString(undefined, { month: "long" });
  return `${weekday}, ${ordinal(d.getDate())} ${month} ${d.getFullYear()}`;
}

export function addMonths(start: string, months: number) {
  const d = parseDateKey(start);
  d.setMonth(d.getMonth() + months);
  return dateKey(d);
}

export function defaultSemester(): Pick<SemesterPeriod, "startDate" | "endDate" | "label"> {
  const start = todayKey();
  return { startDate: start, endDate: addMonths(start, 3), label: "3-month semester" };
}

export function isWithinSemester(dateKeyStr: string, semester: SemesterPeriod | null) {
  if (!semester) return true;
  return dateKeyStr >= semester.startDate && dateKeyStr <= semester.endDate;
}

export function isHoliday(dateKeyStr: string, holidays: Holiday[]) {
  return holidays.some((h) => {
    const end = h.endDate ?? h.startDate;
    return dateKeyStr >= h.startDate && dateKeyStr <= end;
  });
}

export function weekdayForDate(d: Date): Weekday {
  return JS_TO_WEEKDAY[d.getDay()];
}

export function routineBlocksForDate(blocks: RoutineBlock[], d: Date) {
  const wd = weekdayForDate(d);
  return blocks.filter((b) => b.day === wd).sort((a, b) => a.start.localeCompare(b.start));
}

export function classBlocksForDate(blocks: RoutineBlock[], d: Date) {
  return routineBlocksForDate(blocks, d).filter((b) => b.isClass !== false && b.courseId);
}

/** Expand weekly routine into dated class events inside semester, skipping holidays. */
export function expandRoutineDates(
  blocks: RoutineBlock[],
  semester: SemesterPeriod | null,
  holidays: Holiday[],
  from: Date,
  to: Date,
) {
  const out: { date: string; block: RoutineBlock }[] = [];
  const cur = new Date(from);
  cur.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(23, 59, 59, 999);

  const classEndDate = semester?.lastClassDate || semester?.endDate || "";

  while (cur <= end) {
    const key = dateKey(cur);
    const inClassPeriod = semester ? (key >= semester.startDate && key <= classEndDate) : true;
    if (inClassPeriod && !isHoliday(key, holidays)) {
      for (const block of routineBlocksForDate(blocks, cur)) {
        out.push({ date: key, block });
      }
    }
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}
