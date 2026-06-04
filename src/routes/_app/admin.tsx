import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getAdminCredentials } from "@/lib/admin";
import { getSystemEmailConfig, saveSystemEmailConfig } from "@/lib/systemConfig";
import { useSemester } from "@/lib/semesterStore";
import { formatStudyMinutes } from "@/lib/scheduleUtils";
import {
  createTeamMember,
  getStudentProfiles,
  getTeamMembers,
  removeTeamMember,
  removeStudentUser,
  type StudentAdminProfile,
  type TeamMemberProfile,
} from "@/lib/usersAdmin";
import { TEAM_ROLES, getRoleLabel, type UserRole } from "@/lib/userRoles";
import { toast } from "sonner";
import {
  Mail,
  RefreshCw,
  Shield,
  KeyRound,
  Users,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_app/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin · University Command Center" }] }),
});

function AdminPage() {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const { syncToGoogle } = useSemester();
  const creds = getAdminCredentials();

  const [adminForm, setAdminForm] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentAdminProfile[]>([]);
  const [team, setTeam] = useState<TeamMemberProfile[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [teamEmail, setTeamEmail] = useState("");
  const [teamUsername, setTeamUsername] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamPassword, setTeamPassword] = useState("");
  const [teamRole, setTeamRole] = useState<UserRole>("student_support");
  const [teamBusy, setTeamBusy] = useState(false);

  const reloadDirectory = useCallback(async () => {
    const [s, t] = await Promise.all([getStudentProfiles(), getTeamMembers()]);
    setStudents(s);
    setTeam(t);
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      navigate({ to: "/dashboard" });
      return;
    }
    void Promise.all([
      getSystemEmailConfig(),
      reloadDirectory(),
    ]).then(([c]) => {
      setAdminForm(c.adminFormUrl);
      setEnabled(c.enabled);
      setLastSynced(c.lastSyncedAt);
      setLoading(false);
    });
  }, [isAdmin, navigate, reloadDirectory]);

  if (!isAdmin || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        {loading ? "Loading…" : "Redirecting…"}
      </div>
    );
  }

  const save = async (andSync: boolean) => {
    try {
      const next = await saveSystemEmailConfig({ adminFormUrl: adminForm, enabled });
      setLastSynced(next.lastSyncedAt);
      toast.success("System email settings saved");
      if (andSync) {
        await syncToGoogle();
        const updated = await getSystemEmailConfig();
        setLastSynced(updated.lastSyncedAt);
        toast.success("Synced with Google Apps Script");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const addTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeamBusy(true);
    const { error } = await createTeamMember({
      email: teamEmail,
      username: teamUsername,
      fullName: teamName,
      password: teamPassword,
      role: teamRole,
    });
    setTeamBusy(false);
    if (error) return toast.error(error);
    toast.success("Team member added");
    setTeamEmail("");
    setTeamUsername("");
    setTeamName("");
    setTeamPassword("");
    await reloadDirectory();
  };

  const handleRemoveTeam = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from the team? They will become a student account.`)) return;
    const { error } = await removeTeamMember(id);
    if (error) return toast.error(error);
    toast.success("Removed from team");
    await reloadDirectory();
  };

  const handleRemoveStudent = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently remove student ${name}? This will delete all of their course data, attendance logs, exam schedules, routines, and assignments. This action CANNOT be undone.`)) return;
    try {
      const { error } = await removeStudentUser(id);
      if (error) return toast.error(error);
      toast.success("Student account and all associated data permanently removed");
      await reloadDirectory();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove student");
    }
  };

  const staffTeam = team.filter((m) => m.role !== "admin");

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in-up">
      <header>
        <div className="flex items-center gap-2 text-[color:var(--purple)]">
          <Shield className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-wider">Administrator</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Administration</h1>
        <p className="text-sm text-muted-foreground">
          Manage students, team members, and system email settings.
        </p>
      </header>

      <Tabs defaultValue="students" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="students" className="gap-1.5">
            <Users className="h-3.5 w-3.5" /> Students
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-1.5">
            <UserPlus className="h-3.5 w-3.5" /> Team
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-1.5">
            <Mail className="h-3.5 w-3.5" /> Email
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <section className="glass-strong rounded-3xl p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              All students ({students.length})
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Overview of every registered student on this device — expand for course and activity details.
            </p>
            {students.length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground">No student accounts yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {students.map((s) => {
                  const open = expandedId === s.id;
                  return (
                    <li key={s.id} className="rounded-2xl border border-border/60 bg-secondary/20">
                      <button
                        type="button"
                        onClick={() => setExpandedId(open ? null : s.id)}
                        className="flex w-full items-center justify-between gap-3 p-4 text-left"
                      >
                        <div className="min-w-0">
                          <div className="font-medium">{s.fullName}</div>
                          <div className="text-xs text-muted-foreground">
                            @{s.username} · {s.email}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-3 text-xs">
                          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-primary">
                            {s.courseCount} courses
                          </span>
                          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </button>
                      {open && (
                        <div className="border-t border-border/60 px-4 pb-4 pt-3 text-sm">
                          <dl className="grid gap-2 sm:grid-cols-2">
                            <div>
                              <dt className="text-xs text-muted-foreground">Joined</dt>
                              <dd>{new Date(s.createdAt).toLocaleDateString()}</dd>
                            </div>
                            <div>
                              <dt className="text-xs text-muted-foreground">Avg attendance</dt>
                              <dd>{s.avgAttendance !== null ? `${s.avgAttendance}%` : "—"}</dd>
                            </div>
                            <div>
                              <dt className="text-xs text-muted-foreground">Assignments</dt>
                              <dd>
                                {s.assignmentCount} total · {s.pendingAssignments} pending
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs text-muted-foreground">Exams</dt>
                              <dd>{s.examCount}</dd>
                            </div>
                            <div>
                              <dt className="text-xs text-muted-foreground">Study this week</dt>
                              <dd>{formatStudyMinutes(s.studyMinutesThisWeek)}</dd>
                            </div>
                          </dl>
                          {s.courses.length > 0 ? (
                            <div className="mt-4">
                              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Courses
                              </div>
                              <ul className="mt-2 space-y-2">
                                {s.courses.map((c) => (
                                  <li
                                    key={c.code}
                                    className="flex flex-wrap justify-between gap-2 rounded-xl bg-background/40 px-3 py-2 text-xs"
                                  >
                                    <span>
                                      <strong>{c.code}</strong> — {c.name}
                                    </span>
                                    <span className="text-muted-foreground">
                                      {c.attendance}% att. · {c.credits} cr
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <p className="mt-3 text-xs text-muted-foreground">No courses added yet.</p>
                          )}
                          <div className="mt-4 flex justify-end border-t border-border/60 pt-3">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30 gap-1.5"
                              onClick={() => void handleRemoveStudent(s.id, s.fullName)}
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Remove Student Account
                            </Button>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <section className="glass-strong rounded-3xl p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Team members</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Student support, technical, operations, and academic staff — separate from student accounts.
            </p>
            {staffTeam.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No team members yet. Add one below.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {staffTeam.map((m) => (
                  <li
                    key={m.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-secondary/20 px-4 py-3"
                  >
                    <div>
                      <div className="font-medium">{m.fullName}</div>
                      <div className="text-xs text-muted-foreground">
                        @{m.username} · {m.email}
                      </div>
                      <span className="mt-1 inline-block rounded-full bg-[color:var(--cyan)]/15 px-2 py-0.5 text-[10px] font-medium text-[color:var(--cyan)]">
                        {getRoleLabel(m.role)}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => void handleRemoveTeam(m.id, m.fullName)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="glass-strong rounded-3xl p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <UserPlus className="h-4 w-4" /> Add team member
            </h2>
            <form onSubmit={(e) => void addTeamMember(e)} className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full name</Label>
                <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  value={teamUsername}
                  onChange={(e) => setTeamUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                  required
                  minLength={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={teamEmail} onChange={(e) => setTeamEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={teamRole} onValueChange={(v) => setTeamRole(v as UserRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEAM_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {getRoleLabel(r)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Temporary password</Label>
                <Input
                  type="password"
                  minLength={6}
                  value={teamPassword}
                  onChange={(e) => setTeamPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">Share securely; they can change it in Settings.</p>
              </div>
              <Button type="submit" disabled={teamBusy} className="sm:col-span-2 bg-gradient-primary text-primary-foreground">
                {teamBusy ? "Adding…" : "Add to team"}
              </Button>
            </form>
          </section>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <section className="glass-strong rounded-3xl p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <KeyRound className="h-4 w-4" /> Admin account
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Signed in as <strong>{user?.email}</strong> (@{creds.username}). Default admin:{" "}
              <strong>{creds.email}</strong>
            </p>
            {user?.id && <ChangePasswordForm userId={user.id} compact />}
          </section>

          <section className="glass-strong rounded-3xl p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Email reminders</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              One email the day before with all tomorrow&apos;s classes, plus deadline alerts. After 7 days without
              attendance, a check-in email is sent.
            </p>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-form">Admin / support Google Form URL</Label>
                <Input
                  id="admin-form"
                  type="url"
                  value={adminForm}
                  onChange={(e) => setAdminForm(e.target.value)}
                  placeholder="https://docs.google.com/forms/d/..."
                />
              </div>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                <span className="text-sm">Enable scheduled emails for all students</span>
              </label>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" className="gap-2" onClick={() => void save(false)}>
                  <Mail className="h-4 w-4" /> Save
                </Button>
                <Button
                  type="button"
                  className="gap-2 bg-gradient-primary text-primary-foreground"
                  onClick={() => void save(true)}
                >
                  <RefreshCw className="h-4 w-4" /> Save & sync
                </Button>
              </div>
              {lastSynced && (
                <p className="text-xs text-muted-foreground">Last synced: {new Date(lastSynced).toLocaleString()}</p>
              )}
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
