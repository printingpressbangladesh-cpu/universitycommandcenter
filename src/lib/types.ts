export type Course = {
  id: string;
  code: string;
  name: string;
  faculty: string;
  credits: number;
  attendance: number;
  totalClasses: number;
  plannedClasses: number;
  attended: number;
  marks: number;
  progress: number;
  weakTopics: string[];
  color: string;
};

export type Assignment = {
  id: string;
  title: string;
  course: string;
  due: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "done";
  progress: number;
  mark?: number | null;
  maxMark?: number | null;
};

export type Note = {
  id: string;
  title: string;
  body: string;
  course?: string;
  tags: string[];
  pinned: boolean;
  updatedAt: string;
};

export type ExamChecklistItem = {
  id: string;
  courseId: string;
  userId: string;
  text: string;
  done: boolean;
};

export type ExamEntry = {
  id: string;
  userId: string;
  courseId: string;
  title: string;
  /** YYYY-MM-DD */
  date: string;
  status: "upcoming" | "done";
  mark?: number | null;
  maxMark?: number;
  location?: string;
  createdAt: string;
};

export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export type RoutineBlock = {
  id: string;
  day: Weekday;
  start: string;
  end: string;
  title: string;
  location?: string;
  /** Linked course for class attendance tracking */
  courseId?: string;
  courseCode?: string;
  isClass?: boolean;
};

export type SemesterPeriod = {
  userId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  label?: string;
};

export type Holiday = {
  id: string;
  userId: string;
  label: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // same as start for single day
  type: "single" | "range";
};

export type AttendanceLog = {
  id: string;
  userId: string;
  courseId: string;
  date: string; // YYYY-MM-DD
  present: boolean;
  routineBlockId?: string;
  excuse?: string; // required when date !== today
  /** Professor cancelled class — does not affect attendance % */
  cancelled?: boolean;
};

export type NotificationPrefs = {
  userId: string;
  email: string;
  enabled: boolean;
  adminFormUrl: string;
  lastSyncedAt?: string;
};

export type StudySession = {
  id: string;
  userId: string;
  courseId: string;
  date: string; // YYYY-MM-DD
  minutes: number;
  completedAt: string;
};

export type CalendarEvent = {
  id: string;
  date: Date;
  title: string;
  subtitle?: string;
  color: string;
  kind: "class" | "assignment" | "exam" | "holiday" | "other";
};
