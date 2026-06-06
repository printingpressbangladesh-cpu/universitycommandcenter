import { createFileRoute, Outlet, useNavigate, Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import {
  LayoutDashboard, BookOpen, ClipboardList, CalendarCheck2,
  Timer, GraduationCap, NotebookPen, CalendarDays, Settings, LogOut, ListTodo,
  Sun, Moon, Menu, X, Search, Shield, ListChecks, FileQuestion,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/assignments", label: "Assignments", icon: ClipboardList },
  { to: "/attendance", label: "Attendance", icon: CalendarCheck2 },
  { to: "/study", label: "Study Planner", icon: Timer },
  { to: "/routine", label: "Routine", icon: ListTodo },
  { to: "/exams", label: "Exams", icon: GraduationCap },
  { to: "/exam-prep", label: "Exam Prep", icon: ListChecks },
  { to: "/questions", label: "Question Bank", icon: FileQuestion },
  { to: "/notes", label: "Notes", icon: NotebookPen },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function AppLayout() {
  const { session, loading, signOut, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" });
  }, [session, loading, navigate]);

  useEffect(() => { setOpen(false); }, [path]);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    navigate({ to: "/login" });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-pulse rounded-full bg-gradient-primary shadow-glow" />
      </div>
    );
  }
  if (!session) return null;

  const fullName = (user?.user_metadata?.full_name as string) || user?.email?.split("@")[0] || "Student";

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-sidebar-border bg-sidebar/80 p-4 backdrop-blur-xl md:flex md:flex-col">
        <SidebarInner path={path} fullName={fullName} email={user?.email ?? ""} isAdmin={isAdmin} onSignOut={handleSignOut} />
      </aside>

      {/* Sidebar (mobile drawer) */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <aside
            className="absolute left-0 top-0 h-full w-72 border-r border-sidebar-border bg-sidebar p-4 backdrop-blur-xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarInner path={path} fullName={fullName} email={user?.email ?? ""} isAdmin={isAdmin} onSignOut={handleSignOut} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/60 px-4 backdrop-blur-xl md:px-8">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen((o) => !o)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="relative hidden flex-1 max-w-md md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Quick search… courses, notes, assignments"
              className="h-10 w-full rounded-xl border border-border/60 bg-secondary/40 pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
            />
          </div>
          <div className="flex flex-1 items-center justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <div className="hidden h-9 w-9 place-items-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-glow sm:grid">
              {fullName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarInner({
  path, fullName, email, isAdmin, onSignOut,
}: { path: string; fullName: string; email: string; isAdmin: boolean; onSignOut: () => void }) {
  return (
    <>
      <Link to="/dashboard" className="mb-6 flex items-center gap-2.5 px-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
          <GraduationCap className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold">University Command</div>
          <div className="text-[11px] text-muted-foreground">Center</div>
        </div>
      </Link>

      <nav className="flex-1 space-y-1">
        {isAdmin && (
          <Link
            to="/admin"
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
              path === "/admin"
                ? "bg-gradient-primary text-primary-foreground shadow-glow"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
            )}
          >
            <Shield className="h-4.5 w-4.5" />
            <span className="font-medium">Admin</span>
          </Link>
        )}
        {nav.map(({ to, label, icon: Icon }) => {
          const active = path === to || path.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                active
                  ? "bg-gradient-primary text-primary-foreground shadow-glow"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              <Icon className={cn("h-4.5 w-4.5 transition-transform group-hover:scale-110", active && "drop-shadow")} />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 rounded-2xl border border-sidebar-border bg-sidebar-accent/40 p-3">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground">
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{fullName}</div>
            <div className="truncate text-[11px] text-muted-foreground">{email}</div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSignOut();
            }}
            aria-label="Sign out"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors focus:outline-none"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </>
  );
}
