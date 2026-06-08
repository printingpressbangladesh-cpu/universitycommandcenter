-- Migration: Add reason column to study_sessions
ALTER TABLE public.study_sessions 
ADD COLUMN IF NOT EXISTS reason text;
