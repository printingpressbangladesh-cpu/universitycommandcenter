-- Migration: Add target_attendance to courses and target_weekly_study_minutes to semester_settings

ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS target_attendance int DEFAULT 75;

ALTER TABLE public.semester_settings 
ADD COLUMN IF NOT EXISTS target_weekly_study_minutes int DEFAULT 600;
