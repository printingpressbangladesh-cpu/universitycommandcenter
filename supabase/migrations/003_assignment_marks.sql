-- Migration 003: Add mark columns to assignments table
-- Run this in the Supabase SQL Editor if you already have an existing database.

ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS mark numeric;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS max_mark numeric;

-- Also add the admin delete policy for profiles if not already present
drop policy if exists "profiles_admin_delete" on public.profiles;
create policy "profiles_admin_delete" on public.profiles for delete using (
  public.is_admin()
);
