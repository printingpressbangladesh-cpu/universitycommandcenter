import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { getRoleLabel, isTeamRole } from "@/lib/userRoles";
import { resetUserData } from "@/lib/db/resetUserData";
import { toast } from "sonner";
import { Sun, Moon, LogOut, Trash2, Shield, KeyRound } from "lucide-react";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings · University Command Center" }] }),
});

function SettingsPage() {
  const { theme, set } = useTheme();
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const name = (user?.user_metadata?.full_name as string) || "Student";
  const username = user?.user_metadata?.username as string | undefined;
  const role = user?.user_metadata?.role as string | undefined;

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in-up">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Personalize your command center · data synced to Supabase</p>
      </header>

      <section className="glass-strong rounded-3xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Profile</h2>
        <div className="mt-4 flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-primary text-xl font-semibold text-primary-foreground shadow-glow">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-base font-semibold">{name}</div>
            <div className="text-xs text-muted-foreground">{user?.email}</div>
            {isAdmin && (
              <span className="mt-1 inline-block rounded-full bg-[color:var(--purple)]/20 px-2 py-0.5 text-[10px] font-medium uppercase text-[color:var(--purple)]">
                Admin
              </span>
            )}
          </div>
        </div>
      </section>

      {user?.id && (
        <section className="glass-strong rounded-3xl p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <KeyRound className="h-4 w-4" /> Password
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Change your sign-in password. Works for student and administrator accounts.
          </p>
          <ChangePasswordForm userId={user.id} />
        </section>
      )}

      {isAdmin ? (
        <section className="glass-strong rounded-3xl p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Administrator</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Configure email reminders, Google Form link, and system-wide notification sync.
          </p>
          <Link
            to="/admin"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow"
          >
            <Shield className="h-4 w-4" /> Open admin panel
          </Link>
        </section>
      ) : (
        <section className="glass-strong rounded-3xl p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Email reminders</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Class reminders, deadlines, and wellness check-ins are configured by your administrator.
            Once enabled, your data syncs <strong>automatically</strong> every time you log in — no manual action needed.
          </p>
        </section>
      )}

      <section className="glass-strong rounded-3xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Appearance</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {(["dark", "light"] as const).map((t) => (
            <button key={t} onClick={() => set(t)} className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${theme === t ? "border-primary bg-primary/10" : "border-border/60 hover:bg-secondary/40"}`}>
              {t === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <div>
                <div className="text-sm font-medium capitalize">{t} mode</div>
                <div className="text-xs text-muted-foreground">{t === "dark" ? "Deep navy command palette" : "Off-white minimal"}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="glass-strong rounded-3xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Data</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Remove all courses, assignments, notes, and other data for this account on this device.
        </p>
        <button
          type="button"
          onClick={async () => {
            if (!user?.id) return;
            if (!confirm("Delete all your data on this device? This cannot be undone.")) return;
            await resetUserData(user.id);
            toast.success("All data cleared");
            window.location.href = "/dashboard";
          }}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/20"
        >
          <Trash2 className="h-4 w-4" /> Reset all my data
        </button>
      </section>

      <button
        onClick={async () => { await signOut(); navigate({ to: "/login" }); }}
        className="inline-flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/20"
      >
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </div>
  );
}
