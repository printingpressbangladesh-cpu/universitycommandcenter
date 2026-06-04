-- Migration 004: Add room number and submission type to assignments
-- Run this in the Supabase SQL Editor if you already have an existing database.

ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS room_number text;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS submission_type text;
