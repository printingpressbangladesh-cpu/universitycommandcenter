import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/courses")({
  component: CoursesLayout,
});

function CoursesLayout() {
  return <Outlet />;
}
