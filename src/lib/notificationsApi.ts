const API_URL = import.meta.env.VITE_OTP_API_URL as string | undefined;
const ADMIN_FORM = (import.meta.env.VITE_ADMIN_FORM_URL as string | undefined) ?? "";

export type SyncPayload = {
  semester: { startDate: string; endDate: string; label?: string } | null;
  holidays: { label: string; startDate: string; endDate?: string; type: string }[];
  routine: {
    id: string;
    day: string;
    start: string;
    end: string;
    title: string;
    location?: string;
    courseId?: string;
    courseCode?: string;
    isClass?: boolean;
  }[];
  courses: { id: string; code: string; name: string }[];
  assignments: { title: string; course: string; due: string; status: string }[];
  examDates: { courseCode: string; courseId: string; date: string }[];
  exams: {
    id: string;
    courseId: string;
    courseCode: string;
    title: string;
    date: string;
    status: string;
    mark?: number | null;
    maxMark?: number;
  }[];
  lastAttendanceDate: string | null;
  notificationsEnabled: boolean;
  adminFormUrl: string;
};

async function post(body: Record<string, unknown>) {
  if (!API_URL) throw new Error("Add VITE_OTP_API_URL in .env (Google Apps Script web app URL)");
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { ok?: boolean; error?: string };
  if (!res.ok || !data.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

export function sendEmailOtp(email: string) {
  return post({ action: "send", email: email.trim().toLowerCase() });
}

export function verifyEmailOtp(email: string, otp: string) {
  return post({ action: "verify", email: email.trim().toLowerCase(), otp: otp.trim() });
}

export function syncNotifications(email: string, data: SyncPayload) {
  return post({
    action: "sync",
    email: email.trim().toLowerCase(),
    data: { ...data, adminFormUrl: data.adminFormUrl || ADMIN_FORM },
  });
}

export function getDefaultAdminFormUrl() {
  return ADMIN_FORM;
}
