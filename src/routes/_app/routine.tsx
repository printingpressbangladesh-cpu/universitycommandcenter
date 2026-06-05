import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useRoutine, type RoutineBlock } from "@/lib/routineStore";
import { useSemester } from "@/lib/semesterStore";
import { useCourses } from "@/lib/coursesStore";
import { useAuth } from "@/lib/auth";
import { ROUTINE_DAYS } from "@/lib/scheduleUtils";
import { Plus, Trash2, Download } from "lucide-react";
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

function RoutinePage() {
  const { user } = useAuth();
  const { courses } = useCourses();
  const { blocks, days, addBlock, removeBlock } = useRoutine();
  const { semester, holidays, setSemester, addHoliday, removeHoliday, syncToGoogle, prefs } =
    useSemester();

  const [day, setDay] = useState<RoutineBlock["day"]>("Mon");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");
  const [location, setLocation] = useState("");
  const [courseId, setCourseId] = useState<string>("none");

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
          body, html, #root, header, nav, button, select, input, form, section, aside {
            visibility: hidden !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
          }
          
          .print-title, .routine-grid-container, .routine-grid-container * {
            visibility: visible !important;
          }
          
          .print-title {
            display: block !important;
            text-align: center !important;
            color: black !important;
            font-size: 20pt !important;
            font-weight: bold !important;
            margin-bottom: 24pt !important;
          }
          
          .routine-grid-container {
            position: absolute !important;
            left: 0 !important;
            top: 60px !important;
            width: 100% !important;
            display: grid !important;
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 12pt !important;
          }

          .routine-grid-container section {
            border: 1px solid #dddddd !important;
            border-radius: 8pt !important;
            padding: 8pt !important;
            background: #fafafa !important;
            box-shadow: none !important;
          }

          .routine-grid-container section h3 {
            color: #333333 !important;
            font-weight: bold !important;
            border-bottom: 1px solid #cccccc !important;
            padding-bottom: 4pt !important;
            margin-bottom: 8pt !important;
          }

          .routine-grid-container li {
            border: 1px solid #e2e8f0 !important;
            background: white !important;
            box-shadow: none !important;
            border-radius: 6pt !important;
            padding: 6pt !important;
            color: black !important;
          }

          .routine-grid-container li * {
            color: black !important;
          }

          .routine-grid-container button {
            display: none !important;
          }

          html, body, main, [data-router-root] {
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 20px !important;
            background: white !important;
          }
        }
      `}</style>

      <h1 className="hidden print-title font-bold text-center text-black">
        Weekly Class Routine — {semester?.label || "Schedule"}
      </h1>

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
        <h2 className="text-lg font-semibold">Semester period</h2>
        <p className="text-xs text-muted-foreground">Routine & attendance only apply within these dates.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Start date</Label>
            <Input
              type="date"
              value={semester?.startDate ?? ""}
              onChange={(e) => setSemester({ startDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>End date (3-month semester)</Label>
            <Input
              type="date"
              value={semester?.endDate ?? ""}
              onChange={(e) => setSemester({ endDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Label</Label>
            <Input
              value={semester?.label ?? ""}
              onChange={(e) => setSemester({ label: e.target.value })}
              placeholder="Spring 2026"
            />
          </div>
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

      <section className="glass-strong rounded-3xl p-6">
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 routine-grid-container">
        {days.map((d) => {
          const dayBlocks = blocks.filter((b) => b.day === d);
          return (
            <section key={d} className="glass-strong rounded-3xl p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{d}</h3>
              {dayBlocks.length === 0 ? (
                <p className="mt-3 text-xs text-muted-foreground">No blocks yet</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {dayBlocks.map((b) => (
                    <li key={b.id} className="group rounded-xl border border-border/60 bg-secondary/30 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs text-[color:var(--cyan)]">{b.start} – {b.end}</div>
                          <div className="text-sm font-medium">{blockLabel(b)}</div>
                          {b.location && <div className="text-xs text-muted-foreground">{b.location}</div>}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeBlock(b.id)}
                          className="rounded-lg p-1 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Remove"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
