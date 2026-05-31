-- Run AFTER 001 on a new project, OR run this alone on a fresh Supabase project.
-- Uses text IDs for app entities (courses, assignments, etc.) and uuid for auth users.

-- Extend / fix profiles policies
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- Drop dependent foreign key constraints first
alter table public.exams drop constraint if exists exams_course_id_fkey;
alter table public.study_sessions drop constraint if exists study_sessions_course_id_fkey;

-- Courses: text id (app-generated slugs)
alter table public.courses drop constraint if exists courses_pkey;
alter table public.courses alter column id drop default;
alter table public.courses alter column id type text using id::text;
alter table public.courses add primary key (id);

-- Assignments
alter table public.assignments alter column id drop default;
alter table public.assignments alter column id type text using id::text;

-- Notes
alter table public.notes alter column id drop default;
alter table public.notes alter column id type text using id::text;

-- Exams
alter table public.exams alter column id drop default;
alter table public.exams alter column id type text using id::text;
alter table public.exams alter column course_id type text using course_id::text;
alter table public.exams add constraint exams_course_id_fkey foreign key (course_id) references public.courses (id) on delete set null;

-- Study sessions
alter table public.study_sessions alter column id drop default;
alter table public.study_sessions alter column id type text using id::text;
alter table public.study_sessions alter column course_id type text using course_id::text;
alter table public.study_sessions add constraint study_sessions_course_id_fkey foreign key (course_id) references public.courses (id) on delete cascade;

create table if not exists public.exam_dates (
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id text not null,
  iso_date text not null,
  primary key (user_id, course_id)
);

create table if not exists public.routines (
  id text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  day text not null,
  start_time text not null,
  end_time text not null,
  title text not null,
  location text,
  course_id text,
  course_code text,
  is_class boolean default false
);

create table if not exists public.exam_checklist (
  id text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id text not null,
  text text not null,
  done boolean default false
);

create table if not exists public.semester_settings (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  start_date text not null,
  end_date text not null,
  label text
);

create table if not exists public.holidays (
  id text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text not null,
  start_date text not null,
  end_date text,
  type text not null default 'single'
);

create table if not exists public.attendance_logs (
  id text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id text not null,
  date text not null,
  present boolean not null,
  routine_block_id text,
  excuse text,
  cancelled boolean default false
);

create table if not exists public.notification_prefs (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  email text not null default '',
  enabled boolean default false,
  admin_form_url text default '',
  last_synced_at timestamptz
);

alter table public.exam_dates enable row level security;
alter table public.routines enable row level security;
alter table public.exam_checklist enable row level security;
alter table public.semester_settings enable row level security;
alter table public.holidays enable row level security;
alter table public.attendance_logs enable row level security;
alter table public.notification_prefs enable row level security;

create policy "exam_dates_own" on public.exam_dates for all using (auth.uid() = user_id);
create policy "routines_own" on public.routines for all using (auth.uid() = user_id);
create policy "exam_checklist_own" on public.exam_checklist for all using (auth.uid() = user_id);
create policy "semester_settings_own" on public.semester_settings for all using (auth.uid() = user_id);
create policy "holidays_own" on public.holidays for all using (auth.uid() = user_id);
create policy "attendance_logs_own" on public.attendance_logs for all using (auth.uid() = user_id);
create policy "notification_prefs_own" on public.notification_prefs for all using (auth.uid() = user_id);

-- Admin read all student data
create policy "courses_admin_select" on public.courses for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
create policy "assignments_admin_select" on public.assignments for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
create policy "exams_admin_select" on public.exams for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
create policy "study_sessions_admin_select" on public.study_sessions for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

create policy "profiles_admin_update" on public.profiles for update using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Seed default system email config (admin can change in app)
insert into public.system_config (key, data)
values ('email', '{"enabled":false,"adminFormUrl":""}'::jsonb)
on conflict (key) do nothing;
