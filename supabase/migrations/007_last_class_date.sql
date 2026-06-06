-- Migration: Add last_class_date to semester_settings

ALTER TABLE public.semester_settings 
ADD COLUMN IF NOT EXISTS last_class_date text;
