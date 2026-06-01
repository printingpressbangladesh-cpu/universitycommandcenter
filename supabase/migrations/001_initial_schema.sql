-- University Command Center — run in Supabase SQL Editor (new project only)
-- Auth users live in auth.users; app profile + data in public.*

-- ---------------------------------------------------------------------------
-- Profiles (linked to Supabase Auth)
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

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  username text not null unique,
  full_name text not null default '',
  role public.user_role not null default 'student',
  created_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);
create index profiles_username_idx on public.profiles (username);

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

-- ---------------------------------------------------------------------------
-- Student data (per user)
-- ---------------------------------------------------------------------------
create table public.courses (
  id uuid primary key default gen_random_uuid(),
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

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  course text not null,
  due timestamptz not null,
  priority text default 'medium',
  status text default 'todo',
  progress int default 0
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text default '',
  course text,
  tags jsonb default '[]',
  pinned boolean default false,
  updated_at timestamptz default now()
);

create table public.exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid references public.courses (id) on delete set null,
  title text not null,
  date date not null,
  status text default 'upcoming',
  mark numeric,
  max_mark numeric default 100,
  location text,
  created_at timestamptz default now()
);

create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid references public.courses (id) on delete cascade,
  date date not null,
  minutes int not null,
  completed_at timestamptz default now()
);

create table public.system_config (
  key text primary key,
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);
-- Helper function to check if the current user is an admin without causing infinite recursion in RLS policies
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer set search_path = public
as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.assignments enable row level security;
alter table public.notes enable row level security;
alter table public.exams enable row level security;
alter table public.study_sessions enable row level security;
alter table public.system_config enable row level security;

-- Profiles: users read/update own; admins read all
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create policy "profiles_admin_select_all" on public.profiles for select using (
  public.is_admin()
);

-- Student tables: own rows only
create policy "courses_own" on public.courses for all using (auth.uid() = user_id);
create policy "assignments_own" on public.assignments for all using (auth.uid() = user_id);
create policy "notes_own" on public.notes for all using (auth.uid() = user_id);
create policy "exams_own" on public.exams for all using (auth.uid() = user_id);
create policy "study_sessions_own" on public.study_sessions for all using (auth.uid() = user_id);

-- System config: admins only
create policy "system_config_admin" on public.system_config for all using (
  public.is_admin()
);
