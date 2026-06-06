-- Migration: Add Assignment Attachments and Previous Question Bank Tables

-- 1. Assignment Attachments Table
CREATE TABLE IF NOT EXISTS public.assignment_attachments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assignment_id text NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL, -- Storage object key path e.g. "userId/assignmentId/fileName"
  file_size int NOT NULL, -- Size in bytes
  mime_type text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS assignment_attachments_assignment_idx 
ON public.assignment_attachments (assignment_id);

ALTER TABLE public.assignment_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage attachments for their own assignments"
ON public.assignment_attachments
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all assignment attachments"
ON public.assignment_attachments
FOR SELECT
USING (public.is_admin());


-- 2. Previous Question Bank Table
CREATE TABLE IF NOT EXISTS public.question_bank (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_code text NOT NULL,
  course_name text NOT NULL,
  semester_label text, -- e.g. "Spring 2026", "Fall 2025"
  exam_type text NOT NULL, -- 'midterm' | 'final' | 'quiz' | 'practice'
  year int NOT NULL,
  title text NOT NULL,
  description text,
  file_path text NOT NULL, -- Storage key path
  file_name text NOT NULL,
  file_size int NOT NULL,
  mime_type text NOT NULL,
  tags jsonb DEFAULT '[]', -- tags array
  is_public boolean DEFAULT false, -- if shared with all students
  downloads_count int DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS question_bank_search_idx 
ON public.question_bank (course_code, exam_type, year);

CREATE INDEX IF NOT EXISTS question_bank_sharing_idx 
ON public.question_bank (is_public);

ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public questions or their own"
ON public.question_bank
FOR SELECT
USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own questions"
ON public.question_bank
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view and manage all questions"
ON public.question_bank
FOR ALL
USING (public.is_admin());

-- RPC Helper for atomic download counts increments
CREATE OR REPLACE FUNCTION public.increment_downloads_counter(row_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER set search_path = public
AS $$
BEGIN
  UPDATE public.question_bank
  SET downloads_count = downloads_count + 1
  WHERE id = row_id;
END;
$$;

