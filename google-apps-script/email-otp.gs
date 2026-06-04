/**
 * University Command Center — Google Apps Script backend
 *
 * Actions (POST JSON):
 *   sync   — store routine, deadlines, prefs for scheduled emails
 *
 * TRIGGERS (Edit → Triggers → Add trigger):
 *   sendDailyDigests     — Time-driven, Day timer, 6pm–7pm (your timezone)
 *   checkSevenDayAbsence — Time-driven, Day timer, 9am–10am
 *   checkExamMarkReminders — Time-driven, Day timer, 10am–11am
 *
 * DEPLOY: Web app → Execute as Me → Anyone
 * .env: VITE_OTP_API_URL=<web app url>
 *       VITE_ADMIN_FORM_URL=<your Google Form for admin / mental health contact>
 */

var JS_TO_WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var SYNC_PREFIX = "sync_";
var ABSENCE_DAYS = 7;

var FUNNY_MESSAGES = [
  "Tomorrow is a ghost town. No classes! Time to catch up on sleep or pretend you're studying.",
  "Hooray! Tomorrow's routine is empty. Go ahead and start that 12-hour gaming session, your bed is calling.",
  "No classes tomorrow! Your teachers are probably grading your papers, so lay low and enjoy the peace.",
  "Tomorrow is free real estate! Zero lectures scheduled. Don't waste it on reading this email.",
  "No classes tomorrow. Please try to remember what daylight looks like.",
  "Your schedule tomorrow is as empty as my promise to study on weekends. Enjoy the holiday!",
  "Zero classes tomorrow! Time to finally look at that topic you've been avoiding... or just watch memes."
];

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    var email = (body.email || "").toString().trim().toLowerCase();

    if (action === "sync") {
      if (!email || email.indexOf("@") < 1) return json({ ok: false, error: "Invalid email" });
      return syncUser(email, body.data || {});
    }

    return json({ ok: false, error: "Unknown action" });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json({
    ok: true,
    message: "University Command Center API. POST: sync",
  });
}

// ——— Sync ———

function syncUser(email, data) {
  var store = {
    email: email,
    semester: data.semester || null,
    holidays: data.holidays || [],
    routine: data.routine || [],
    courses: data.courses || [],
    assignments: data.assignments || [],
    examDates: data.examDates || [],
    exams: data.exams || [],
    lastAttendanceDate: data.lastAttendanceDate || null,
    notificationsEnabled: !!data.notificationsEnabled,
    adminFormUrl: (data.adminFormUrl || "").toString(),
    lastSyncedAt: new Date().toISOString(),
    lastDigestDate: null,
    lastAbsenceEmailAt: null,
    lastMarkReminderDate: null,
    lastHealthEmailMonth: null,
  };

  var existing = getSync(email);
  if (existing) {
    store.lastDigestDate = existing.lastDigestDate;
    store.lastAbsenceEmailAt = existing.lastAbsenceEmailAt;
    store.lastMarkReminderDate = existing.lastMarkReminderDate;
    store.lastHealthEmailMonth = existing.lastHealthEmailMonth;
  }

  PropertiesService.getScriptProperties().setProperty(SYNC_PREFIX + email, JSON.stringify(store));
  return json({ ok: true });
}

function getSync(email) {
  var raw = PropertiesService.getScriptProperties().getProperty(SYNC_PREFIX + email);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function listSyncedEmails() {
  var props = PropertiesService.getScriptProperties().getProperties();
  var emails = [];
  for (var key in props) {
    if (key.indexOf(SYNC_PREFIX) === 0) {
      emails.push(key.substring(SYNC_PREFIX.length));
    }
  }
  return emails;
}

function saveSync(email, data) {
  PropertiesService.getScriptProperties().setProperty(SYNC_PREFIX + email, JSON.stringify(data));
}

// ——— Schedule helpers ———

function dateKey(d) {
  var y = d.getFullYear();
  var m = ("0" + (d.getMonth() + 1)).slice(-2);
  var day = ("0" + d.getDate()).slice(-2);
  return y + "-" + m + "-" + day;
}

function parseDateKey(key) {
  var p = key.split("-");
  return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
}

function weekdayForDate(d) {
  return JS_TO_WEEKDAY[d.getDay()];
}

function isWithinSemester(key, semester) {
  if (!semester) return true;
  return key >= semester.startDate && key <= semester.endDate;
}

function isHoliday(key, holidays) {
  for (var i = 0; i < holidays.length; i++) {
    var h = holidays[i];
    var end = h.endDate || h.startDate;
    if (key >= h.startDate && key <= end) return true;
  }
  return false;
}

function classesForDate(data, targetKey) {
  var d = parseDateKey(targetKey);
  var wd = weekdayForDate(d);
  var out = [];
  for (var i = 0; i < data.routine.length; i++) {
    var b = data.routine[i];
    if (b.day !== wd) continue;
    if (b.isClass === false || !b.courseId) continue;
    out.push(b);
  }
  out.sort(function (a, b) {
    return a.start.localeCompare(b.start);
  });
  return out;
}

function tomorrowKey() {
  var t = new Date();
  t.setDate(t.getDate() + 1);
  return dateKey(t);
}

function getRandomFunnyMessage() {
  var index = Math.floor(Math.random() * FUNNY_MESSAGES.length);
  return FUNNY_MESSAGES[index];
}

// ——— Daily digest ———

function sendDailyDigests() {
  var emails = listSyncedEmails();
  var tomorrow = tomorrowKey();

  for (var i = 0; i < emails.length; i++) {
    var email = emails[i];
    var data = getSync(email);
    if (!data || !data.notificationsEnabled) continue;

    var todayObj = new Date();
    var today = dateKey(todayObj);

    // 5. Monthly Health Email Day 5 Check
    var todayDay = todayObj.getDate();
    if (todayDay === 5) {
      var healthMonthKey = todayObj.getFullYear() + "-" + (todayObj.getMonth() + 1);
      if (data.lastHealthEmailMonth !== healthMonthKey) {
        sendHealthEmail(email, data);
        data.lastHealthEmailMonth = healthMonthKey;
        saveSync(email, data);
      }
    }

    if (data.lastDigestDate === today) continue;

    var isHol = isHoliday(tomorrow, data.holidays);
    var isSem = isWithinSemester(tomorrow, data.semester);

    var classes = [];
    if (!isHol && isSem) {
      classes = classesForDate(data, tomorrow);
    }

    // 1 & 2. Get assignments & exams for yesterday (1 day remaining) and 2 days earlier (2 days remaining)
    var dueTomorrow = getAssignmentsDueIn(data, 1);
    var dueIn2Days = getAssignmentsDueIn(data, 2);

    var examsTomorrow = getExamsIn(data, 1);
    var examsIn2Days = getExamsIn(data, 2);

    var holidayMsg = "";
    if (isHol) {
      holidayMsg = "Tomorrow is a holiday! No classes whatsoever. Go celebrate!";
    } else if (!isSem) {
      holidayMsg = "Tomorrow is outside your active semester period. Relax, the command center is in sleep mode!";
    }

    var html = "";
    if (holidayMsg) {
      html = buildHolidayDigestHtml(tomorrow, holidayMsg, dueTomorrow, dueIn2Days, examsTomorrow, examsIn2Days);
    } else {
      html = buildDigestHtml(tomorrow, classes, dueTomorrow, dueIn2Days, examsTomorrow, examsIn2Days);
    }

    MailApp.sendEmail({
      to: email,
      subject: "Your Daily Schedule Digest · University Command Center",
      htmlBody: html,
    });

    data.lastDigestDate = today;
    saveSync(email, data);
  }
}

function getAssignmentsDueIn(data, daysRemaining) {
  var now = new Date();
  now.setHours(0, 0, 0, 0);
  var out = [];
  var list = data.assignments || [];
  for (var i = 0; i < list.length; i++) {
    var a = list[i];
    var due = new Date(a.due);
    due.setHours(0, 0, 0, 0);
    var diff = Math.round((due - now) / (24 * 60 * 60 * 1000));
    if (diff === daysRemaining) {
      out.push(a);
    }
  }
  return out;
}

function getExamsIn(data, daysRemaining) {
  var now = new Date();
  now.setHours(0, 0, 0, 0);
  var out = [];
  var list = data.exams || [];
  for (var i = 0; i < list.length; i++) {
    var ex = list[i];
    if (ex.status !== "upcoming") continue;

    // Check creation date: (if exam is created on previous date relative to exam date, i.e. created on/after exam date, no email)
    if (ex.createdAt) {
      var examDateStr = ex.date;
      var createdDateStr = ex.createdAt.substring(0, 10);
      if (createdDateStr >= examDateStr) {
        continue;
      }
    }

    var examDate = parseDateKey(ex.date);
    examDate.setHours(0, 0, 0, 0);
    var diff = Math.round((examDate - now) / (24 * 60 * 60 * 1000));
    if (diff === daysRemaining) {
      out.push(ex);
    }
  }
  return out;
}

function buildDigestHtml(tomorrow, classes, dueTomorrow, dueIn2Days, examsTomorrow, examsIn2Days) {
  var parts = ["<div style='font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #e2e8f0;border-radius:16px;background:#ffffff;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);'>"];
  parts.push("<h2 style='color:#7c3aed;margin-top:0;'>University Command Center</h2>");
  parts.push("<p style='color:#64748b;font-size:14px;margin-bottom:20px;'>Daily schedule and reminder digest for tomorrow, <strong>" + tomorrow + "</strong>.</p>");
  parts.push("<hr style='border:0;border-top:1px solid #f1f5f9;margin:20px 0;'/>");

  // 3. Classes Routine or Funny message
  parts.push("<h3 style='color:#0f172a;margin-bottom:12px;font-size:16px;'>Classes Tomorrow</h3>");
  if (classes.length > 0) {
    parts.push("<ul style='list-style:none;padding:0;margin:0;'>");
    for (var i = 0; i < classes.length; i++) {
      var c = classes[i];
      var loc = c.location ? " (Room: " + c.location + ")" : " (No room set)";
      parts.push("<li style='padding:12px;background:#f8fafc;border-radius:10px;margin-bottom:8px;border-left:4px solid #7c3aed;'>");
      parts.push("<strong style='color:#1e1b4b;'>" + c.start + " - " + c.end + "</strong>: " + (c.courseCode || c.title) + " - " + c.title + "<span style='color:#64748b;font-size:12px;margin-left:4px;'>" + loc + "</span>");
      parts.push("</li>");
    }
    parts.push("</ul>");
  } else {
    parts.push("<p style='font-style:italic;color:#166534;background:#f0fdf4;padding:16px;border-radius:10px;border-left:4px solid #22c55e;margin:0;font-size:14px;line-height:1.5;'>🎉 " + getRandomFunnyMessage() + "</p>");
  }

  // 2. Exams Section (2 days earlier and yesterday of exam date)
  if (examsTomorrow.length > 0 || examsIn2Days.length > 0) {
    parts.push("<hr style='border:0;border-top:1px solid #f1f5f9;margin:20px 0;'/>");
    parts.push("<h3 style='color:#0f172a;margin-bottom:12px;font-size:16px;'>Upcoming Exams</h3>");
    parts.push("<ul style='list-style:none;padding:0;margin:0;'>");
    for (var j = 0; j < examsTomorrow.length; j++) {
      var exT = examsTomorrow[j];
      var loc = exT.location ? " (Room: " + exT.location + ")" : " (No room set)";
      parts.push("<li style='padding:12px;background:#fef2f2;border-radius:10px;margin-bottom:8px;border-left:4px solid #dc2626;'>");
      parts.push("<strong style='color:#dc2626;'>TOMORROW (" + exT.date + "):</strong> " + (exT.courseCode || "") + " — " + exT.title + "<span style='color:#64748b;font-size:12px;margin-left:4px;'>" + loc + "</span>");
      parts.push("</li>");
    }
    for (var k = 0; k < examsIn2Days.length; k++) {
      var ex2 = examsIn2Days[k];
      var loc = ex2.location ? " (Room: " + ex2.location + ")" : " (No room set)";
      parts.push("<li style='padding:12px;background:#fff7ed;border-radius:10px;margin-bottom:8px;border-left:4px solid #ea580c;'>");
      parts.push("<strong style='color:#ea580c;'>IN 2 DAYS (" + ex2.date + "):</strong> " + (ex2.courseCode || "") + " — " + ex2.title + "<span style='color:#64748b;font-size:12px;margin-left:4px;'>" + loc + "</span>");
      parts.push("</li>");
    }
    parts.push("</ul>");
  }

  // 1. Assignments Section (2 days earlier and yesterday of deadline)
  if (dueTomorrow.length > 0 || dueIn2Days.length > 0) {
    parts.push("<hr style='border:0;border-top:1px solid #f1f5f9;margin:20px 0;'/>");
    parts.push("<h3 style='color:#0f172a;margin-bottom:12px;font-size:16px;'>Upcoming Assignments</h3>");
    parts.push("<div style='display:grid;gap:10px;'>");
    for (var l = 0; l < dueTomorrow.length; l++) {
      parts.push(buildAssignmentCardHtml("TOMORROW", dueTomorrow[l]));
    }
    for (var m = 0; m < dueIn2Days.length; m++) {
      parts.push(buildAssignmentCardHtml("IN 2 DAYS", dueIn2Days[m]));
    }
    parts.push("</div>");
  }

  parts.push("<hr style='border:0;border-top:1px solid #f1f5f9;margin:20px 0;'/>");
  parts.push("<p style='color:#94a3b8;font-size:11px;text-align:center;margin-bottom:0;'>Manage notifications in University Command Center under Settings.</p>");
  parts.push("</div>");

  return parts.join("");
}

function buildHolidayDigestHtml(tomorrow, breakMsg, dueTomorrow, dueIn2Days, examsTomorrow, examsIn2Days) {
  var parts = ["<div style='font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #e2e8f0;border-radius:16px;background:#ffffff;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);'>"];
  parts.push("<h2 style='color:#7c3aed;margin-top:0;'>University Command Center</h2>");
  parts.push("<p style='color:#64748b;font-size:14px;margin-bottom:20px;'>Daily schedule and reminder digest for tomorrow, <strong>" + tomorrow + "</strong>.</p>");
  parts.push("<hr style='border:0;border-top:1px solid #f1f5f9;margin:20px 0;'/>");

  // Break / Holiday
  parts.push("<h3 style='color:#0f172a;margin-bottom:12px;font-size:16px;'>Classes Tomorrow</h3>");
  parts.push("<p style='font-style:italic;color:#1e3a8a;background:#eff6ff;padding:16px;border-radius:10px;border-left:4px solid #3b82f6;margin:0;font-size:14px;line-height:1.5;'>🌴 " + breakMsg + "</p>");

  // Exams
  if (examsTomorrow.length > 0 || examsIn2Days.length > 0) {
    parts.push("<hr style='border:0;border-top:1px solid #f1f5f9;margin:20px 0;'/>");
    parts.push("<h3 style='color:#0f172a;margin-bottom:12px;font-size:16px;'>Upcoming Exams</h3>");
    parts.push("<ul style='list-style:none;padding:0;margin:0;'>");
    for (var j = 0; j < examsTomorrow.length; j++) {
      var exT = examsTomorrow[j];
      var loc = exT.location ? " (Room: " + exT.location + ")" : " (No room set)";
      parts.push("<li style='padding:12px;background:#fef2f2;border-radius:10px;margin-bottom:8px;border-left:4px solid #dc2626;'>");
      parts.push("<strong style='color:#dc2626;'>TOMORROW (" + exT.date + "):</strong> " + (exT.courseCode || "") + " — " + exT.title + "<span style='color:#64748b;font-size:12px;margin-left:4px;'>" + loc + "</span>");
      parts.push("</li>");
    }
    for (var k = 0; k < examsIn2Days.length; k++) {
      var ex2 = examsIn2Days[k];
      var loc = ex2.location ? " (Room: " + ex2.location + ")" : " (No room set)";
      parts.push("<li style='padding:12px;background:#fff7ed;border-radius:10px;margin-bottom:8px;border-left:4px solid #ea580c;'>");
      parts.push("<strong style='color:#ea580c;'>IN 2 DAYS (" + ex2.date + "):</strong> " + (ex2.courseCode || "") + " — " + ex2.title + "<span style='color:#64748b;font-size:12px;margin-left:4px;'>" + loc + "</span>");
      parts.push("</li>");
    }
    parts.push("</ul>");
  }

  // Assignments
  if (dueTomorrow.length > 0 || dueIn2Days.length > 0) {
    parts.push("<hr style='border:0;border-top:1px solid #f1f5f9;margin:20px 0;'/>");
    parts.push("<h3 style='color:#0f172a;margin-bottom:12px;font-size:16px;'>Upcoming Assignments</h3>");
    parts.push("<div style='display:grid;gap:10px;'>");
    for (var l = 0; l < dueTomorrow.length; l++) {
      parts.push(buildAssignmentCardHtml("TOMORROW", dueTomorrow[l]));
    }
    for (var m = 0; m < dueIn2Days.length; m++) {
      parts.push(buildAssignmentCardHtml("IN 2 DAYS", dueIn2Days[m]));
    }
    parts.push("</div>");
  }

  parts.push("<hr style='border:0;border-top:1px solid #f1f5f9;margin:20px 0;'/>");
  parts.push("<p style='color:#94a3b8;font-size:11px;text-align:center;margin-bottom:0;'>Manage notifications in University Command Center under Settings.</p>");
  parts.push("</div>");

  return parts.join("");
}

function buildAssignmentCardHtml(timeLabel, a) {
  var borderCol = timeLabel === "TOMORROW" ? "#dc2626" : "#ea580c";
  var bgCol = timeLabel === "TOMORROW" ? "#fef2f2" : "#fff7ed";
  var labelCol = timeLabel === "TOMORROW" ? "#dc2626" : "#ea580c";

  var room = a.roomNumber || "Not specified";
  
  var statusText = "To do";
  if (a.status === "in_progress" || a.status === "in-progress") statusText = "In progress";
  if (a.status === "done" || a.status === "completed") statusText = "Completed";

  var subType = "Online";
  if (a.submissionType === "hard_copy" || a.submissionType === "hard-copy") subType = "Hard copy";

  var priorityLabel = (a.priority || "medium").toUpperCase();
  var priorityColor = "#64748b";
  if (a.priority === "high") priorityColor = "#ef4444";
  if (a.priority === "medium") priorityColor = "#f59e0b";
  if (a.priority === "low") priorityColor = "#10b981";

  var dueStr = a.due;
  if (dueStr.indexOf("T") > 0) dueStr = dueStr.substring(0, 10);

  var html = "";
  html += "<div style='padding:15px;background:" + bgCol + ";border-radius:10px;border-left:4px solid " + borderCol + ";margin-bottom:10px;'>";
  html += "<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;'>";
  html += "<span style='font-size:11px;font-weight:bold;color:" + labelCol + ";text-transform:uppercase;'>" + timeLabel + " (" + dueStr + ")</span>";
  html += "<span style='font-size:10px;background:" + priorityColor + ";color:#ffffff;padding:2px 6px;border-radius:4px;font-weight:bold;text-transform:uppercase;'>" + priorityLabel + "</span>";
  html += "</div>";
  html += "<h4 style='margin:0 0 6px 0;color:#0f172a;font-size:15px;'>" + a.title + "</h4>";
  html += "<p style='margin:0 0 8px 0;font-size:12px;color:#475569;'><strong>Subject:</strong> " + a.course + "</p>";
  
  html += "<div style='display:flex;flex-wrap:wrap;gap:12px;font-size:12px;color:#64748b;border-top:1px dashed #e2e8f0;padding-top:8px;'>";
  html += "<div><strong>Room:</strong> " + room + "</div>";
  html += "<div><strong>Status:</strong> " + statusText + "</div>";
  html += "<div><strong>Submission:</strong> " + subType + "</div>";
  html += "</div>";
  html += "</div>";
  return html;
}

// ——— Remind to add marks after exam is done ———

function checkExamMarkReminders() {
  var emails = listSyncedEmails();
  var today = dateKey(new Date());

  for (var i = 0; i < emails.length; i++) {
    var email = emails[i];
    var data = getSync(email);
    if (!data || !data.notificationsEnabled) continue;

    var need = examsNeedingMark(data);
    if (need.length === 0) continue;
    if (data.lastMarkReminderDate === today) continue;

    var html =
      "<h2>Add your exam marks</h2>" +
      "<p>You marked these exams as finished but haven't saved a mark yet:</p><ul>";
    for (var j = 0; j < need.length; j++) {
      var ex = need[j];
      html +=
        "<li><strong>" +
        (ex.courseCode || "") +
        "</strong> — " +
        ex.title +
        " (" +
        ex.date +
        ")</li>";
    }
    html +=
      "</ul><p>Open the <strong>Exams</strong> tab in University Command Center to enter your score.</p>";

    MailApp.sendEmail({
      to: email,
      subject: "Add your exam marks · University Command Center",
      htmlBody: html,
    });

    data.lastMarkReminderDate = today;
    saveSync(email, data);
  }
}

function examsNeedingMark(data) {
  var today = dateKey(new Date());
  var list = data.exams || [];
  var out = [];
  for (var i = 0; i < list.length; i++) {
    var ex = list[i];
    if (ex.status !== "done") continue;
    if (ex.mark !== null && ex.mark !== undefined && ex.mark !== "") continue;
    if (ex.date > today) continue;
    out.push(ex);
  }
  return out;
}

// ——— 4. 7-day absence / inactivity ———

function checkSevenDayAbsence() {
  var emails = listSyncedEmails();
  var today = dateKey(new Date());

  for (var i = 0; i < emails.length; i++) {
    var email = emails[i];
    var data = getSync(email);
    if (!data || !data.notificationsEnabled) continue;

    var last = data.lastAttendanceDate || (data.lastSyncedAt || "").substring(0, 10);
    if (!last) continue;

    var lastD = parseDateKey(last);
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    var diff = Math.round((now - lastD) / (24 * 60 * 60 * 1000));
    if (diff < ABSENCE_DAYS) continue;

    if (data.lastAbsenceEmailAt === today) continue;

    var formUrl = data.adminFormUrl || "https://forms.google.com";
    var html = buildAbsenceEmailHtml(diff, formUrl);

    MailApp.sendEmail({
      to: email,
      subject: "We are worried about you · University Command Center",
      htmlBody: html,
    });

    data.lastAbsenceEmailAt = today;
    saveSync(email, data);
  }
}

function buildAbsenceEmailHtml(diff, formUrl) {
  var html = "";
  html += "<div style='font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:25px;border:1px solid #e2e8f0;border-radius:16px;background:#ffffff;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);'>";
  html += "<h2 style='color:#dc2626;margin-top:0;'>University Command Center Check-in</h2>";
  html += "<hr style='border:0;border-top:1px solid #f1f5f9;margin:20px 0;' />";
  html += "<p style='font-size:16px;line-height:1.6;color:#334155;'>Hello,</p>";
  html += "<p style='font-size:16px;line-height:1.6;color:#334155;'>";
  html += "We noticed that you have not logged in or recorded your attendance for <strong>" + diff + " days</strong>.";
  html += "</p>";
  html += "<div style='background:#fef2f2;border-left:4px solid #ef4444;padding:16px;border-radius:8px;margin:20px 0;'>";
  html += "<p style='margin:0;font-size:15px;color:#991b1b;font-weight:500;'>";
  html += "You are absent for 7days. how admin team is so worried about you.";
  html += "</p>";
  html += "</div>";
  html += "<p style='font-size:15px;line-height:1.6;color:#475569;'>";
  html += "please fill-up the form to inform admin team why you are absent and thank you and all. also take care thing.";
  html += "</p>";
  html += "<p style='text-align:center;margin:30px 0;'>";
  html += "<a href='" + formUrl + "' style='background:#7c3aed;color:#ffffff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:bold;display:inline-block;box-shadow:0 4px 10px rgba(124,58,237,0.3);'>";
  html += "Fill up Absence / Support Form";
  html += "</a>";
  html += "</p>";
  html += "<p style='font-size:15px;line-height:1.6;color:#475569;'>";
  html += "Thank you and all. Please take care of yourself!";
  html += "</p>";
  html += "<hr style='border:0;border-top:1px solid #f1f5f9;margin:20px 0;' />";
  html += "<p style='font-size:12px;color:#94a3b8;text-align:center;margin-bottom:0;'>";
  html += "This is an automated check-in notification from your University Command Center portal.";
  html += "</p>";
  html += "</div>";
  return html;
}

// ——— 5. Monthly Health Email ———

function sendHealthEmail(email, data) {
  var formUrl = data.adminFormUrl || "https://forms.google.com";
  var html = buildHealthEmailHtml(formUrl);
  MailApp.sendEmail({
    to: email,
    subject: "Taking care of your health · University Command Center",
    htmlBody: html,
  });
}

function buildHealthEmailHtml(formUrl) {
  var html = "";
  html += "<div style='font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:25px;border:1px solid #e2e8f0;border-radius:16px;background:#ffffff;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);'>";
  html += "<h2 style='color:#059669;margin-top:0;'>🌿 Monthly Health & Wellbeing Check</h2>";
  html += "<hr style='border:0;border-top:1px solid #f1f5f9;margin:20px 0;' />";
  html += "<p style='font-size:16px;line-height:1.6;color:#334155;'>Hello,</p>";
  html += "<p style='font-size:15px;line-height:1.6;color:#334155;'>";
  html += "It's the 5th of the month! This is your gentle reminder to take a moment and focus on taking care of your health. ";
  html += "Academics can be stressful, but your physical and mental wellbeing always come first.";
  html += "</p>";
  html += "<div style='background:#ecfdf5;border-left:4px solid #10b981;padding:16px;border-radius:8px;margin:20px 0;'>";
  html += "<h4 style='margin:0 0 8px 0;color:#065f46;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;'>Quick Health Checklist:</h4>";
  html += "<ul style='margin:0;padding-left:20px;font-size:14px;color:#047857;line-height:1.6;'>";
  html += "<li><strong>Stay Hydrated:</strong> Keep a water bottle nearby and drink at least 8 glasses of water today.</li>";
  html += "<li><strong>Restful Sleep:</strong> Ensure you get 7-8 hours of sleep. Pulling all-nighters hurts cognitive function!</li>";
  html += "<li><strong>Daily Movement:</strong> Stand up, stretch, and take a 10-minute walk outside.</li>";
  html += "<li><strong>Mindfulness:</strong> Take 5 deep breaths and unplug from screens for a short break.</li>";
  html += "</ul>";
  html += "</div>";
  html += "<p style='font-size:14px;line-height:1.6;color:#475569;'>";
  html += "If you're feeling overwhelmed, burnt out, or need mental health guidance, please don't hesitate to reach out. ";
  html += "The administrative support team is here to listen and help you.";
  html += "</p>";
  html += "<p style='text-align:center;margin:25px 0;'>";
  html += "<a href='" + formUrl + "' style='background:#10b981;color:#ffffff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:bold;display:inline-block;box-shadow:0 4px 10px rgba(16,185,129,0.3);'>";
  html += "Open Support / Admin Form";
  html += "</a>";
  html += "</p>";
  html += "<p style='font-size:15px;line-height:1.6;color:#334155;'>";
  html += "Take care of yourself, stay safe, and have a wonderful month ahead!";
  html += "</p>";
  html += "<hr style='border:0;border-top:1px solid #f1f5f9;margin:20px 0;' />";
  html += "<p style='font-size:12px;color:#94a3b8;text-align:center;margin-bottom:0;'>";
  html += "University Command Center · Settings & Preferences can be managed in the portal.";
  html += "</p>";
  html += "</div>";
  return html;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
