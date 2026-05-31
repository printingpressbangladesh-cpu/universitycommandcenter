/**
 * University Command Center — Google Apps Script backend
 *
 * Actions (POST JSON):
 *   send   — signup OTP
 *   verify — confirm OTP
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

var OTP_TTL_MS = 10 * 60 * 1000;
var JS_TO_WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var SYNC_PREFIX = "sync_";
var ABSENCE_DAYS = 7;

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    var email = (body.email || "").toString().trim().toLowerCase();

    if (action === "sync") {
      if (!email || email.indexOf("@") < 1) return json({ ok: false, error: "Invalid email" });
      return syncUser(email, body.data || {});
    }

    if (!email || email.indexOf("@") < 1) {
      return json({ ok: false, error: "Invalid email" });
    }
    if (action === "send") return sendOtp(email);
    if (action === "verify") return verifyOtp(email, (body.otp || "").toString().trim());

    return json({ ok: false, error: "Unknown action" });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json({
    ok: true,
    message: "University Command Center API. POST: send | verify | sync",
  });
}

// ——— OTP ———

function sendOtp(email) {
  var otp = String(Math.floor(100000 + Math.random() * 900000));
  PropertiesService.getScriptProperties().setProperty("otp_" + email, otp + "|" + Date.now());

  MailApp.sendEmail({
    to: email,
    subject: "Your University Command Center verification code",
    htmlBody:
      "<p>Your verification code is:</p>" +
      "<p style='font-size:28px;font-weight:bold;letter-spacing:4px'>" +
      otp +
      "</p>" +
      "<p>Expires in 10 minutes.</p>",
  });
  return json({ ok: true });
}

function verifyOtp(email, otp) {
  var raw = PropertiesService.getScriptProperties().getProperty("otp_" + email);
  if (!raw) return json({ ok: false, error: "No code sent for this email" });

  var parts = raw.split("|");
  if (Date.now() - parseInt(parts[1], 10) > OTP_TTL_MS) {
    PropertiesService.getScriptProperties().deleteProperty("otp_" + email);
    return json({ ok: false, error: "Code expired — request a new one" });
  }
  if (parts[0] !== otp) return json({ ok: false, error: "Invalid code" });

  PropertiesService.getScriptProperties().deleteProperty("otp_" + email);
  return json({ ok: true });
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
  };

  var existing = getSync(email);
  if (existing) {
    store.lastDigestDate = existing.lastDigestDate;
    store.lastAbsenceEmailAt = existing.lastAbsenceEmailAt;
    store.lastMarkReminderDate = existing.lastMarkReminderDate;
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

// ——— Schedule helpers (mirror app scheduleUtils) ———

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

// ——— Daily digest: one email, all classes tomorrow + deadlines ———

function sendDailyDigests() {
  var emails = listSyncedEmails();
  var tomorrow = tomorrowKey();

  for (var i = 0; i < emails.length; i++) {
    var email = emails[i];
    var data = getSync(email);
    if (!data || !data.notificationsEnabled) continue;

    var today = dateKey(new Date());
    if (data.lastDigestDate === today) continue;

    if (!isWithinSemester(tomorrow, data.semester) || isHoliday(tomorrow, data.holidays)) {
      data.lastDigestDate = today;
      saveSync(email, data);
      continue;
    }

    var classes = classesForDate(data, tomorrow);
    var deadlines = upcomingDeadlines(data, 3);
    var tomorrowExams = examsOnDate(data, tomorrow);

    if (classes.length === 0 && deadlines.length === 0 && tomorrowExams.length === 0) {
      data.lastDigestDate = today;
      saveSync(email, data);
      continue;
    }

    var html = buildDigestHtml(tomorrow, classes, deadlines, tomorrowExams);
    MailApp.sendEmail({
      to: email,
      subject: "Tomorrow's schedule · University Command Center",
      htmlBody: html,
    });

    data.lastDigestDate = today;
    saveSync(email, data);
  }
}

function upcomingDeadlines(data, withinDays) {
  var now = new Date();
  now.setHours(0, 0, 0, 0);
  var out = [];
  for (var i = 0; i < data.assignments.length; i++) {
    var a = data.assignments[i];
    if (a.status === "done") continue;
    var due = new Date(a.due);
    due.setHours(0, 0, 0, 0);
    var diff = Math.round((due - now) / (24 * 60 * 60 * 1000));
    if (diff >= 0 && diff <= withinDays) {
      out.push({ title: a.title, course: a.course, due: a.due, days: diff });
    }
  }
  out.sort(function (a, b) {
    return a.due.localeCompare(b.due);
  });
  return out;
}

function examsOnDate(data, dateKeyStr) {
  var list = data.exams || [];
  var out = [];
  for (var i = 0; i < list.length; i++) {
    var ex = list[i];
    if (ex.date === dateKeyStr && ex.status === "upcoming") {
      out.push(ex);
    }
  }
  return out;
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

function buildDigestHtml(tomorrow, classes, deadlines, tomorrowExams) {
  tomorrowExams = tomorrowExams || [];
  var parts = ["<h2>University Command Center</h2>"];
  parts.push("<p>Here is your reminder for <strong>" + tomorrow + "</strong> (sent the day before).</p>");

  if (tomorrowExams.length) {
    parts.push("<h3>Exams tomorrow (" + tomorrowExams.length + ")</h3><ul>");
    for (var e = 0; e < tomorrowExams.length; e++) {
      var ex = tomorrowExams[e];
      parts.push(
        "<li><strong>" +
          (ex.courseCode || "Exam") +
          "</strong> — " +
          ex.title +
          (ex.maxMark ? " (out of " + ex.maxMark + ")" : "") +
          "</li>",
      );
    }
    parts.push("</ul>");
  }

  if (classes.length) {
    parts.push("<h3>All classes tomorrow (" + classes.length + ")</h3><ul>");
    for (var i = 0; i < classes.length; i++) {
      var c = classes[i];
      parts.push(
        "<li><strong>" +
          (c.courseCode || c.title) +
          "</strong> — " +
          c.title +
          " · " +
          c.start +
          "–" +
          c.end +
          (c.location ? " · " + c.location : "") +
          "</li>",
      );
    }
    parts.push("</ul>");
  }

  if (deadlines.length) {
    parts.push("<h3>Upcoming deadlines</h3><ul>");
    for (var j = 0; j < deadlines.length; j++) {
      var d = deadlines[j];
      var when =
        d.days === 0 ? "Due today" : d.days === 1 ? "Due tomorrow" : "Due in " + d.days + " days";
      parts.push("<li><strong>" + d.course + "</strong> — " + d.title + " (" + when + ")</li>");
    }
    parts.push("</ul>");
  }

  parts.push("<p style='color:#666;font-size:12px'>Manage exams in the Exams tab and tap Sync exam emails.</p>");
  return parts.join("");
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

// ——— 7-day absence / inactivity ———

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
    var html =
      "<h2>We noticed you've been away</h2>" +
      "<p>You haven't logged attendance in <strong>" +
      diff +
      " days</strong>. We'd like to know how you're doing:</p>" +
      "<ul>" +
      "<li>Are you ill or recovering?</li>" +
      "<li>Busy with work, travel, or family?</li>" +
      "<li>Feeling mental pressure or burnout?</li>" +
      "</ul>" +
      "<p>If you're under mental pressure, please reach out — you are not alone. " +
      "Contact admin using this form:</p>" +
      "<p><a href='" +
      formUrl +
      "'>Open support / admin form</a></p>" +
      "<p style='color:#666;font-size:12px'>Open the app when you can to update attendance or sync your routine.</p>";

    MailApp.sendEmail({
      to: email,
      subject: "Checking in · University Command Center",
      htmlBody: html,
    });

    data.lastAbsenceEmailAt = today;
    saveSync(email, data);
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
