-- University Command Center — FULL UNIFIED SCHEMA
-- Run this once in the Supabase SQL Editor to configure your new project.
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role' and typnamespace = 'public'::regnamespace) then
    create type public.user_role as enum (
      'admin',
      'student',
      'student_support',
      'technical',
      'operations',
      'academic'
    );
  end if;
end
$$;

-- 2. Profiles (linked to Supabase Auth)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  username text not null unique,
  full_name text not null default '',
  role public.user_role not null default 'student',
  created_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_username_idx on public.profiles (username);

-- Auto-create profile on signup (set username via app metadata or trigger update)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    case coalesce(new.raw_user_meta_data->>'role', 'student')
      when 'admin' then 'admin'::public.user_role
      when 'student_support' then 'student_support'::public.user_role
      when 'technical' then 'technical'::public.user_role
      when 'operations' then 'operations'::public.user_role
      when 'academic' then 'academic'::public.user_role
      else 'student'::public.user_role
    end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Core Application Tables
create table if not exists public.courses (
  id text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  code text not null,
  name text not null,
  faculty text default '',
  credits int default 0,
  attendance int default 0,
  total_classes int default 0,
  planned_classes int default 0,
  attended int default 0,
  marks int default 0,
  progress int default 0,
  weak_topics jsonb default '[]',
  color text default '#6366f1',
  created_at timestamptz default now()
);

create table if not exists public.assignments (
  id text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  course text not null,
  due timestamptz not null,
  priority text default 'medium',
  status text default 'todo',
  progress int default 0
);

create table if not exists public.notes (
  id text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text default '',
  course text,
  tags jsonb default '[]',
  pinned boolean default false,
  updated_at timestamptz default now()
);

create table if not exists public.exams (
  id text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id text references public.courses (id) on delete set null,
  title text not null,
  date date not null,
  status text default 'upcoming',
  mark numeric,
  max_mark numeric default 100,
  location text,
  created_at timestamptz default now()
);

create table if not exists public.study_sessions (
  id text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id text references public.courses (id) on delete cascade,
  date date not null,
  minutes int not null,
  completed_at timestamptz default now()
);

create table if not exists public.system_config (
  key text primary key,
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);

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

-- 4. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.assignments enable row level security;
alter table public.notes enable row level security;
alter table public.exams enable row level security;
alter table public.study_sessions enable row level security;
alter table public.system_config enable row level security;
alter table public.exam_dates enable row level security;
alter table public.routines enable row level security;
alter table public.exam_checklist enable row level security;
alter table public.semester_settings enable row level security;
alter table public.holidays enable row level security;
alter table public.attendance_logs enable row level security;
alter table public.notification_prefs enable row level security;

-- 5. Row Level Security Policies
-- Profiles policies
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
drop policy if exists "profiles_admin_select_all" on public.profiles;
create policy "profiles_admin_select_all" on public.profiles for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles for update using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Student-specific data tables policies
drop policy if exists "courses_own" on public.courses;
create policy "courses_own" on public.courses for all using (auth.uid() = user_id);
drop policy if exists "assignments_own" on public.assignments;
create policy "assignments_own" on public.assignments for all using (auth.uid() = user_id);
drop policy if exists "notes_own" on public.notes;
create policy "notes_own" on public.notes for all using (auth.uid() = user_id);
drop policy if exists "exams_own" on public.exams;
create policy "exams_own" on public.exams for all using (auth.uid() = user_id);
drop policy if exists "study_sessions_own" on public.study_sessions;
create policy "study_sessions_own" on public.study_sessions for all using (auth.uid() = user_id);
drop policy if exists "exam_dates_own" on public.exam_dates;
create policy "exam_dates_own" on public.exam_dates for all using (auth.uid() = user_id);
drop policy if exists "routines_own" on public.routines;
create policy "routines_own" on public.routines for all using (auth.uid() = user_id);
drop policy if exists "exam_checklist_own" on public.exam_checklist;
create policy "exam_checklist_own" on public.exam_checklist for all using (auth.uid() = user_id);
drop policy if exists "semester_settings_own" on public.semester_settings;
create policy "semester_settings_own" on public.semester_settings for all using (auth.uid() = user_id);
drop policy if exists "holidays_own" on public.holidays;
create policy "holidays_own" on public.holidays for all using (auth.uid() = user_id);
drop policy if exists "attendance_logs_own" on public.attendance_logs;
create policy "attendance_logs_own" on public.attendance_logs for all using (auth.uid() = user_id);
drop policy if exists "notification_prefs_own" on public.notification_prefs;
create policy "notification_prefs_own" on public.notification_prefs for all using (auth.uid() = user_id);

-- System Config: admins only
drop policy if exists "system_config_admin" on public.system_config;
create policy "system_config_admin" on public.system_config for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Admin read-all access for student auditing
drop policy if exists "courses_admin_select" on public.courses;
create policy "courses_admin_select" on public.courses for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
drop policy if exists "assignments_admin_select" on public.assignments;
create policy "assignments_admin_select" on public.assignments for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
drop policy if exists "exams_admin_select" on public.exams;
create policy "exams_admin_select" on public.exams for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
drop policy if exists "study_sessions_admin_select" on public.study_sessions;
create policy "study_sessions_admin_select" on public.study_sessions for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- 6. Initial Data Seeding
insert into public.system_config (key, data)
values ('email', '{"enabled":false,"adminFormUrl":""}'::jsonb)
on conflict (key) do nothing;
