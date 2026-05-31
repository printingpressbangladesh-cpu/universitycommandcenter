import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider } from "@/lib/auth";
import { AssignmentsProvider } from "@/lib/assignmentsStore";
import { CoursesProvider } from "@/lib/coursesStore";
import { NotesProvider } from "@/lib/notesStore";
import { RoutineProvider } from "@/lib/routineStore";
import { SemesterProvider } from "@/lib/semesterStore";
import { ExamsProvider } from "@/lib/examsStore";
import { StudyProvider } from "@/lib/studyStore";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-strong max-w-md rounded-3xl p-10 text-center">
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-strong max-w-md rounded-3xl p-10 text-center">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Try again.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Try again
          </button>
          <a href="/" className="rounded-xl border px-5 py-2.5 text-sm font-medium hover:bg-accent/30">Home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "University Command Center" },
      { name: "description", content: "Track courses, attendance, study planner, exams and routines — beautifully organised for students." },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CoursesProvider>
            <SemesterProvider>
              <ExamsProvider>
                <AssignmentsProvider>
                  <NotesProvider>
                    <RoutineProvider>
                      <StudyProvider>
                        <Outlet />
                        <Toaster />
                      </StudyProvider>
                    </RoutineProvider>
                  </NotesProvider>
                </AssignmentsProvider>
              </ExamsProvider>
            </SemesterProvider>
          </CoursesProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
