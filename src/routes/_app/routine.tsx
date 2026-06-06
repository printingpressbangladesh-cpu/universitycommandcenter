import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useRoutine, type RoutineBlock } from "@/lib/routineStore";
import { useSemester } from "@/lib/semesterStore";
import { useCourses } from "@/lib/coursesStore";
import { useAuth } from "@/lib/auth";
import { dateKey, parseDateKey, ROUTINE_DAYS, todayKey } from "@/lib/scheduleUtils";
import { Plus, Trash2, Download, Save, CalendarX, CheckCircle2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CourseSelect } from "@/components/CourseSelect";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_app/routine")({
  component: RoutinePage,
  head: () => ({ meta: [{ title: "Routine · University Command Center" }] }),
});

// ─── Last Date of Class helper ──────────────────────────────────────────────
const JS_WEEKDAY: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

function computeLastClassDate(
  endDate: string,
  blocks: RoutineBlock[],
  holidays: import("@/lib/types").Holiday[],
): string | null {
  if (!endDate || blocks.length === 0) return null;
  // Weekday numbers that have at least one class block
  const classDays = new Set(blocks.map((b) => JS_WEEKDAY[b.day]));
  if (classDays.size === 0) return null;
  // Build a Set of holiday date-keys
  const holidayKeys = new Set<string>();
  for (const h of holidays) {
    const start = parseDateKey(h.startDate);
    const end = h.endDate ? parseDateKey(h.endDate) : start;
    const cur = new Date(start);
    while (cur <= end) {
      holidayKeys.add(dateKey(cur));
      cur.setDate(cur.getDate() + 1);
    }
  }
  // Walk backward from endDate
  const end = parseDateKey(endDate);
  const limit = new Date(end);
  limit.setDate(limit.getDate() - 120); // don't search more than 120 days back
  const cursor = new Date(end);
  while (cursor >= limit) {
    const dk = dateKey(cursor);
    if (classDays.has(cursor.getDay()) && !holidayKeys.has(dk)) {
      return dk;
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return null;
}

function RoutinePage() {
  const { user } = useAuth();
  const { courses } = useCourses();
  const { blocks, days, addBlock, removeBlock } = useRoutine();
  const { semester, holidays, setSemester, addHoliday, removeHoliday, syncToGoogle, prefs } =
    useSemester();

  // ─── Local draft state for semester dates (explicit Save) ────────────────
  const [draftStart, setDraftStart] = useState(semester?.startDate ?? "");
  const [draftEnd, setDraftEnd] = useState(semester?.endDate ?? "");
  const [draftLabel, setDraftLabel] = useState(semester?.label ?? "");
  const [draftLastClassDate, setDraftLastClassDate] = useState(semester?.lastClassDate ?? "");
  const [saved, setSaved] = useState(true);
  const [isEditingLastClass, setIsEditingLastClass] = useState(false);

  // Sync draft when semester loads from DB
  useEffect(() => {
    if (semester) {
      setDraftStart(semester.startDate ?? "");
      setDraftEnd(semester.endDate ?? "");
      setDraftLabel(semester.label ?? "");
      setDraftLastClassDate(semester.lastClassDate ?? "");
      setSaved(true);
    }
  }, [semester?.startDate, semester?.endDate, semester?.label, semester?.lastClassDate]);

  const isDirty =
    draftStart !== (semester?.startDate ?? "") ||
    draftEnd !== (semester?.endDate ?? "") ||
    draftLabel !== (semester?.label ?? "") ||
    draftLastClassDate !== (semester?.lastClassDate ?? "");

  const handleSaveSemester = () => {
    if (!draftStart || !draftEnd) {
      toast.error("Please set both start and end dates.");
      return;
    }
    if (draftEnd < draftStart) {
      toast.error("End date must be after start date.");
      return;
    }
    if (draftLastClassDate) {
      if (draftLastClassDate < draftStart) {
        toast.error("Last class date cannot be before start date.");
        return;
      }
      if (draftLastClassDate > draftEnd) {
        toast.error("Last class date cannot be after end date.");
        return;
      }
    }
    setSemester({
      startDate: draftStart,
      endDate: draftEnd,
      label: draftLabel,
      lastClassDate: draftLastClassDate || undefined,
    });
    setSaved(true);
    toast.success("Semester settings saved!");
  };

  // ─── Last date of class ───────────────────────────────────────────────────
  const autoLastClassDate = useMemo(
    () => computeLastClassDate(draftEnd || semester?.endDate || "", blocks, holidays),
    [draftEnd, semester?.endDate, blocks, holidays],
  );

  const activeLastClassDate = draftLastClassDate || autoLastClassDate;

  const lastClassInfo = useMemo(() => {
    if (!activeLastClassDate) return null;
    const d = parseDateKey(activeLastClassDate);
    const today = parseDateKey(todayKey());
    const daysUntil = Math.round((d.getTime() - today.getTime()) / 86_400_000);
    const label = d.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    return { dateKey: activeLastClassDate, label, daysUntil, isOverridden: !!draftLastClassDate };
  }, [activeLastClassDate, draftLastClassDate]);

  const [day, setDay] = useState<RoutineBlock["day"]>("Mon");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");
  const [location, setLocation] = useState("");
  const [courseId, setCourseId] = useState<string>("none");

  // --- Weekly Schedule Grid and Notes Helpers ---
  const timeSlots = useMemo(() => {
    const slots = new Set<string>();
    blocks.forEach((b) => {
      if (b.start && b.end) {
        slots.add(`${b.start} - ${b.end}`);
      }
    });

    const sorted = Array.from(slots).sort((a, b) => {
      const startA = a.split(" - ")[0];
      const startB = b.split(" - ")[0];
      return startA.localeCompare(startB);
    });

    if (sorted.length === 0) {
      return [
        "09:00 - 10:00",
        "10:00 - 11:00",
        "11:00 - 12:00",
        "12:00 - 13:00",
        "14:00 - 15:00",
        "15:00 - 16:00",
        "16:00 - 17:00",
      ];
    }
    return sorted;
  }, [blocks]);

  const daysMap: Record<string, string> = {
    Mon: "Monday",
    Tue: "Tuesday",
    Wed: "Wednesday",
    Thu: "Thursday",
    Fri: "Friday",
    Sat: "Saturday",
    Sun: "Sunday",
  };

  const columnsToDisplay = useMemo(() => {
    const defaultDays: ("Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun")[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const hasSat = blocks.some((b) => b.day === "Sat");
    const hasSun = blocks.some((b) => b.day === "Sun");

    const display = [...defaultDays];
    if (hasSat) display.push("Sat");
    if (hasSun) display.push("Sun");
    return display;
  }, [blocks]);

  const [rowNotes, setRowNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem("routine_notes");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleNoteChange = (timeslot: string, val: string) => {
    const updated = { ...rowNotes, [timeslot]: val };
    setRowNotes(updated);
    localStorage.setItem("routine_notes", JSON.stringify(updated));
  };

  const handleAddClassClick = (clickedDay: string, timeslot: string) => {
    const [tOpen, tClose] = timeslot.split(" - ");
    setDay(clickedDay as RoutineBlock["day"]);
    setStart(tOpen);
    setEnd(tClose);
    
    const el = document.getElementById("add-class-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const [holLabel, setHolLabel] = useState("");
  const [holStart, setHolStart] = useState("");
  const [holEnd, setHolEnd] = useState("");
  const [holType, setHolType] = useState<"single" | "range">("single");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (courseId === "none") {
      toast.error("Select a course for this class");
      return;
    }
    const c = courses.find((x) => x.id === courseId);
    if (!c) return;
    addBlock({
      day,
      start,
      end,
      title: c.name,
      location: location.trim() || undefined,
      courseId,
      courseCode: c.code,
      isClass: true,
    });
    setLocation("");
    toast.success("Added to routine — calendar updates automatically");
    if (prefs?.enabled) {
      void syncToGoogle().catch(() => {});
    }
  };

  const handleHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holLabel.trim() || !holStart) return;
    if (holType === "range" && holEnd && holEnd < holStart) {
      toast.error("End date must be on or after start date");
      return;
    }
    addHoliday({
      label: holLabel.trim(),
      startDate: holStart,
      endDate: holType === "range" ? holEnd || holStart : holStart,
      type: holType,
    });
    setHolLabel("");
    setHolStart("");
    setHolEnd("");
    toast.success("Holiday saved");
  };

  const blockLabel = (b: RoutineBlock) => {
    const c = courses.find((x) => x.id === b.courseId);
    return c ? `${c.code} — ${c.name}` : b.title;
  };

  const downloadCSV = () => {
    if (blocks.length === 0) {
      toast.error("No routine data to download");
      return;
    }
    const headers = ["Day", "Start Time", "End Time", "Course Code", "Class Title", "Location"];
    const rows = blocks.map((b) => [
      b.day,
      b.start,
      b.end,
      b.courseCode || "",
      b.title,
      b.location || "",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.map((val) => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `routine_${semester?.label?.replace(/\s+/g, "_") || "schedule"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Routine CSV downloaded successfully");
  };

  const downloadICS = () => {
    if (blocks.length === 0) {
      toast.error("No routine data to download");
      return;
    }
    
    let icsContent = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//University Command Center//Routine Maker//EN\r\n";
    
    const dayMap: Record<string, string> = {
      Mon: "MO",
      Tue: "TU",
      Wed: "WE",
      Thu: "TH",
      Fri: "FR",
      Sat: "SA",
      Sun: "SU",
    };
    
    const getRecurUntil = () => {
      if (semester?.endDate) {
        const dateStr = semester.endDate.replace(/-/g, "");
        return `;UNTIL=${dateStr}T235959Z`;
      }
      const d = new Date();
      d.setMonth(d.getMonth() + 3);
      const dateStr = d.toISOString().split("T")[0].replace(/-/g, "");
      return `;UNTIL=${dateStr}T235959Z`;
    };
    
    blocks.forEach((b) => {
      const dayAbbr = dayMap[b.day];
      if (!dayAbbr) return;
      
      const startTime = b.start.replace(/:/g, "");
      const endTime = b.end.replace(/:/g, "");
      
      const baseDate = semester?.startDate ? new Date(semester.startDate) : new Date();
      const dayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
        ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].find((d) => d.startsWith(b.day)) || "Mon"
      );
      while (baseDate.getDay() !== dayIndex) {
        baseDate.setDate(baseDate.getDate() + 1);
      }
      
      const yyyymmdd = baseDate.toISOString().split("T")[0].replace(/-/g, "");
      const uid = `${b.id}@universitycommandcenter`;
      
      icsContent += "BEGIN:VEVENT\r\n";
      icsContent += `UID:${uid}\r\n`;
      icsContent += `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z\r\n`;
      icsContent += `DTSTART;TZID=Asia/Dhaka:${yyyymmdd}T${startTime}00\r\n`;
      icsContent += `DTEND;TZID=Asia/Dhaka:${yyyymmdd}T${endTime}00\r\n`;
      icsContent += `SUMMARY:${b.title} (${b.courseCode || ""})\r\n`;
      if (b.location) icsContent += `LOCATION:${b.location}\r\n`;
      icsContent += `RRULE:FREQ=WEEKLY;BYDAY=${dayAbbr}${getRecurUntil()}\r\n`;
      icsContent += "END:VEVENT\r\n";
    });
    
    icsContent += "END:VCALENDAR\r\n";
    
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `routine_${semester?.label?.replace(/\s+/g, "_") || "schedule"}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Routine Calendar (ICS) downloaded successfully");
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <style>{`
        @media print {
          /* Hide everything by default */
          body * {
            visibility: hidden;
          }
          
          /* Show the printable schedule card and its descendents */
          .printable-schedule-card,
          .printable-schedule-card * {
            visibility: visible !important;
          }
          
          /* Position the card on the printing page */
          .printable-schedule-card {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            background-color: #B18CFE !important;
            border-radius: 16px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-shadow: none !important;
          }

          /* Ensure table cells print with white background and borders */
          .printable-schedule-card th {
            background-color: #f9fafb !important;
            color: #374151 !important;
            border: 1.5px solid #B18CFE !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .printable-schedule-card td {
            background-color: white !important;
            color: #111827 !important;
            border: 1.5px solid #B18CFE !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Hide UI-only elements */
          .no-print {
            display: none !important;
          }

          .no-print-textarea {
            display: none !important;
          }

          .print-notes-text {
            display: block !important;
          }

          /* Page size and layout */
          @page {
            size: landscape;
            margin: 10mm;
          }

          /* Reset margin and padding of body/main wrapper */
          html, body, main, [data-router-root] {
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
        }
      `}</style>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Routine Maker</h1>
          <p className="text-sm text-muted-foreground">
            Classes sync to Calendar & Attendance. Default semester length is 3 months.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" className="gap-2 cursor-pointer">
                <Download className="h-4 w-4" /> Download Routine
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-strong border-border/60 rounded-2xl w-48 z-50">
              <DropdownMenuItem onClick={downloadCSV} className="cursor-pointer">
                Download as Excel (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={downloadICS} className="cursor-pointer">
                Download Calendar (ICS)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.print()} className="cursor-pointer">
                Print / Save PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <section className="glass-strong rounded-3xl p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold">Semester period</h2>
            <p className="text-xs text-muted-foreground">Routine &amp; attendance only apply within these dates.</p>
          </div>
          <div className="flex items-center gap-3">
            {isDirty && (
              <span className="flex items-center gap-1.5 text-xs text-[color:var(--warning)] font-medium">
                <span className="h-2 w-2 rounded-full bg-[color:var(--warning)] animate-pulse" />
                Unsaved changes
              </span>
            )}
            {!isDirty && saved && semester?.startDate && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> Saved
              </span>
            )}
            <Button
              type="button"
              onClick={handleSaveSemester}
              disabled={!isDirty}
              className="gap-2 bg-gradient-primary text-primary-foreground shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" /> Save semester
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Start date</Label>
            <Input
              type="date"
              value={draftStart}
              onChange={(e) => { setDraftStart(e.target.value); setSaved(false); }}
            />
          </div>
          <div className="space-y-2">
            <Label>End date</Label>
            <Input
              type="date"
              value={draftEnd}
              onChange={(e) => { setDraftEnd(e.target.value); setSaved(false); }}
            />
          </div>
          <div className="space-y-2">
            <Label>Label</Label>
            <Input
              value={draftLabel}
              onChange={(e) => { setDraftLabel(e.target.value); setSaved(false); }}
              placeholder="Spring 2026"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Last class date</Label>
              {draftLastClassDate && (
                <button
                  type="button"
                  onClick={() => { setDraftLastClassDate(""); setSaved(false); }}
                  className="text-[10px] text-primary hover:underline hover:text-primary/80 transition-colors"
                >
                  Clear override
                </button>
              )}
            </div>
            <Input
              type="date"
              value={draftLastClassDate}
              onChange={(e) => { setDraftLastClassDate(e.target.value); setSaved(false); }}
              placeholder="Default"
            />
          </div>
        </div>

        {/* Last Date of Class */}
        <div className="mt-5 pt-5 border-t border-border/40">
          <div className="flex items-center gap-2 mb-1">
            <CalendarX className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Last Date of Class</span>
          </div>
          {lastClassInfo ? (
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <div className="glass rounded-2xl px-5 py-3 flex flex-col min-w-[220px] relative group transition-all duration-300">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span>Date</span>
                  {lastClassInfo.isOverridden && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDraftLastClassDate("");
                        setSaved(false);
                      }}
                      className="text-[10px] text-primary hover:underline hover:text-primary/80 transition-colors normal-case font-normal"
                    >
                      Reset to Default
                    </button>
                  )}
                </div>
                {isEditingLastClass ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="date"
                      value={draftLastClassDate || activeLastClassDate || ""}
                      onChange={(e) => {
                        setDraftLastClassDate(e.target.value);
                        setSaved(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setIsEditingLastClass(false);
                        }
                      }}
                      className="h-8 py-1 px-2 text-sm bg-background/50 border-border/50 text-foreground w-36"
                      autoFocus
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingLastClass(false)}
                      className="h-8 px-2 text-xs"
                    >
                      Done
                    </Button>
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-between gap-2 mt-0.5 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => setIsEditingLastClass(true)}
                  >
                    <span className="text-lg font-semibold">{lastClassInfo.label}</span>
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-primary transition-colors ml-2" />
                  </div>
                )}
              </div>
              <div className={`glass rounded-2xl px-5 py-3 flex flex-col ${
                lastClassInfo.daysUntil < 0 ? "border border-muted-foreground/20" :
                lastClassInfo.daysUntil <= 7 ? "border border-destructive/30 bg-destructive/5" :
                lastClassInfo.daysUntil <= 30 ? "border border-[color:var(--warning)]/30 bg-[color:var(--warning)]/5" :
                "border border-emerald-500/20 bg-emerald-500/5"
              }`}>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Countdown</span>
                <span className={`text-lg font-bold mt-0.5 ${
                  lastClassInfo.daysUntil < 0 ? "text-muted-foreground" :
                  lastClassInfo.daysUntil <= 7 ? "text-destructive" :
                  lastClassInfo.daysUntil <= 30 ? "text-[color:var(--warning)]" :
                  "text-emerald-400"
                }`}>
                  {lastClassInfo.daysUntil < 0
                    ? `${Math.abs(lastClassInfo.daysUntil)} days ago`
                    : lastClassInfo.daysUntil === 0
                    ? "Today!"
                    : `${lastClassInfo.daysUntil} days away`}
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-2 flex flex-col gap-2">
              <p className="text-xs text-muted-foreground">
                {blocks.length === 0
                  ? "Add classes to your routine to compute the last class date."
                  : draftEnd
                  ? "No class days found before the end date — check your routine and holidays."
                  : "Set the semester end date above to compute the last class date."
                }
              </p>
              <div className="mt-1">
                {isEditingLastClass ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={draftLastClassDate}
                      onChange={(e) => {
                        setDraftLastClassDate(e.target.value);
                        setSaved(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setIsEditingLastClass(false);
                        }
                      }}
                      className="h-8 py-1 px-2 text-sm bg-background/50 border-border/50 text-foreground w-40"
                      autoFocus
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingLastClass(false)}
                      className="h-8 px-2 text-xs"
                    >
                      Done
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingLastClass(true)}
                    className="text-xs h-7 gap-1"
                  >
                    <Plus className="h-3 w-3" /> Set custom last date
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="glass-strong rounded-3xl p-6">
        <h2 className="text-lg font-semibold">Holidays</h2>
        <p className="text-xs text-muted-foreground">Single day or date range — no classes on these days.</p>
        <form onSubmit={handleHoliday} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-2 sm:col-span-2">
            <Label>Name</Label>
            <Input value={holLabel} onChange={(e) => setHolLabel(e.target.value)} placeholder="Eid vacation" required />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <CourseSelect
              value={holType}
              onValueChange={(v) => setHolType(v as "single" | "range")}
              options={[
                { value: "single", label: "Single day" },
                { value: "range", label: "Date range" },
              ]}
            />
          </div>
          <div className="space-y-2">
            <Label>Start</Label>
            <Input type="date" value={holStart} onChange={(e) => setHolStart(e.target.value)} required />
          </div>
          {holType === "range" && (
            <div className="space-y-2">
              <Label>End</Label>
              <Input type="date" value={holEnd} onChange={(e) => setHolEnd(e.target.value)} />
            </div>
          )}
          <div className="flex items-end">
            <Button type="submit" variant="secondary" className="w-full">Add holiday</Button>
          </div>
        </form>
        {holidays.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {holidays.map((h) => (
              <li key={h.id} className="flex items-center gap-2 rounded-full border border-border/60 bg-secondary/40 px-3 py-1 text-xs">
                <span>
                  {h.label}: {h.startDate}
                  {h.type === "range" && h.endDate && h.endDate !== h.startDate ? ` → ${h.endDate}` : ""}
                </span>
                <button type="button" onClick={() => removeHoliday(h.id)} className="text-muted-foreground hover:text-destructive">×</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="add-class-section" className="glass-strong rounded-3xl p-6">
        <h2 className="text-lg font-semibold">Add weekly class</h2>
        <p className="text-xs text-muted-foreground">Pick the course — name comes from your course list.</p>
        {courses.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Add courses first, then build your weekly routine.</p>
        ) : (
          <form onSubmit={handleAdd} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label>Day</Label>
              <CourseSelect
                value={day}
                onValueChange={(v) => setDay(v as RoutineBlock["day"])}
                options={ROUTINE_DAYS.map((d) => ({ value: d, label: d }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Start</Label>
              <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>End</Label>
              <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Course</Label>
              <CourseSelect
                value={courseId}
                onValueChange={setCourseId}
                options={[
                  { value: "none", label: "Select course" },
                  ...courses.map((c) => ({ value: c.id, label: `${c.code} — ${c.name}` })),
                ]}
              />
            </div>
            <div className="space-y-2">
              <Label>Location (optional)</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Room 404" />
            </div>
            <div className="flex items-end sm:col-span-2 lg:col-span-5">
              <Button type="submit" className="bg-gradient-primary text-primary-foreground shadow-glow">
                <Plus className="mr-2 h-4 w-4" /> Add to routine
              </Button>
            </div>
          </form>
        )}
        {!prefs?.enabled && (
          <p className="mt-3 text-xs text-muted-foreground">
            Email reminders sync automatically when enabled by your administrator.
          </p>
        )}
      </section>

      <div className="printable-schedule-card bg-[#B18CFE] rounded-[24px] p-6 sm:p-8 text-white shadow-soft relative overflow-hidden">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Weekly Class Schedule</h2>
          {semester?.label && (
            <p className="text-white/80 text-sm mt-1 font-medium">{semester.label}</p>
          )}
        </div>
        
        <div className="overflow-x-auto w-full rounded-2xl border border-[#B18CFE] bg-[#B18CFE]">
          <table className="w-full border-collapse table-fixed min-w-[800px] bg-[#B18CFE]">
            <thead>
              <tr className="bg-white">
                <th className="w-[120px] p-3 text-sm font-semibold text-gray-700 border border-[#B18CFE] text-center select-none">
                  Time
                </th>
                {columnsToDisplay.map((d) => (
                  <th key={d} className="p-3 text-sm font-semibold text-gray-700 border border-[#B18CFE] text-center select-none">
                    {daysMap[d]}
                  </th>
                ))}
                <th className="w-[180px] p-3 text-sm font-semibold text-gray-700 border border-[#B18CFE] text-center select-none">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((timeslot) => (
                <tr key={timeslot}>
                  {/* Time Cell */}
                  <td className="p-3 bg-white text-sm font-bold text-gray-800 border border-[#B18CFE] text-center select-none">
                    {timeslot}
                  </td>
                  
                  {/* Day Cells */}
                  {columnsToDisplay.map((d) => {
                    const cellBlocks = blocks.filter(
                      (b) => b.day === d && `${b.start} - ${b.end}` === timeslot
                    );
                    
                    return (
                      <td
                        key={`${d}-${timeslot}`}
                        className="p-3 bg-white text-gray-800 border border-[#B18CFE] align-middle relative group transition-colors duration-200 hover:bg-gray-50/50"
                      >
                        {cellBlocks.length > 0 ? (
                          <div className="space-y-2">
                            {cellBlocks.map((b) => (
                              <div
                                key={b.id}
                                className="relative pr-6 group/block"
                              >
                                <div className="text-xs font-bold text-gray-900">
                                  {b.courseCode || "CLASS"}
                                </div>
                                <div className="text-xs text-gray-700 line-clamp-2 leading-snug">
                                  {b.title}
                                </div>
                                {b.location && (
                                  <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                                    📍 {b.location}
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    removeBlock(b.id);
                                    toast.success("Removed class from routine");
                                  }}
                                  className="absolute right-0 top-0 rounded p-0.5 text-gray-400 opacity-0 group-hover/block:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive no-print"
                                  aria-label="Remove"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddClassClick(d, timeslot)}
                            className="absolute inset-0 flex items-center justify-center text-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-primary hover:bg-primary/5 no-print"
                            title="Add class at this time"
                          >
                            <Plus className="h-5 w-5" />
                          </button>
                        )}
                      </td>
                    );
                  })}

                  {/* Notes Cell */}
                  <td className="p-2 bg-white text-gray-800 border border-[#B18CFE] align-middle relative">
                    <textarea
                      value={rowNotes[timeslot] ?? ""}
                      onChange={(e) => handleNoteChange(timeslot, e.target.value)}
                      placeholder="Add note..."
                      rows={1}
                      className="w-full text-xs bg-transparent border-none resize-none outline-none focus:ring-0 focus:outline-none placeholder-gray-400 text-center text-gray-700 p-1 no-print-textarea"
                    />
                    <div className="hidden print-notes-text text-center text-xs text-gray-700 leading-snug break-words max-w-full px-1">
                      {rowNotes[timeslot] || ""}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
