import { getSupabase } from "./client";
import type { QuestionBankItem } from "@/lib/types";

const BUCKET_NAME = "question-bank";

export interface QuestionFilters {
  query?: string;
  courseCode?: string;
  examType?: string;
  year?: number;
  isPublicOnly?: boolean;
}

export async function listQuestions(filters: QuestionFilters = {}): Promise<QuestionBankItem[]> {
  const sb = getSupabase();
  let query = sb.from("question_bank").select("*");

  if (filters.courseCode) {
    query = query.ilike("course_code", `%${filters.courseCode}%`);
  }
  
  if (filters.examType) {
    query = query.eq("exam_type", filters.examType);
  }
  
  if (filters.year) {
    query = query.eq("year", filters.year);
  }

  if (filters.isPublicOnly) {
    query = query.eq("is_public", true);
  }

  if (filters.query) {
    const term = `%${filters.query}%`;
    query = query.or(`title.ilike.${term},course_name.ilike.${term},description.ilike.${term}`);
  }

  // Order by newest first
  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    courseCode: row.course_code,
    courseName: row.course_name,
    semesterLabel: row.semester_label ?? undefined,
    examType: row.exam_type as QuestionBankItem["examType"],
    year: row.year,
    title: row.title,
    description: row.description ?? undefined,
    filePath: row.file_path,
    fileName: row.file_name,
    fileSize: row.file_size,
    mimeType: row.mime_type,
    tags: (row.tags as string[]) ?? [],
    isPublic: !!row.is_public,
    downloadsCount: row.downloads_count ?? 0,
    createdAt: row.created_at,
  }));
}

export async function uploadQuestion(
  userId: string,
  input: {
    courseCode: string;
    courseName: string;
    semesterLabel?: string;
    examType: QuestionBankItem["examType"];
    year: number;
    title: string;
    description?: string;
    isPublic: boolean;
    tags: string[];
    file: File;
  }
): Promise<QuestionBankItem> {
  const sb = getSupabase();

  if (input.file.size > 20 * 1024 * 1024) {
    throw new Error("File exceeds maximum size limit of 20MB");
  }

  // Generate clean storage path
  const sanitizedName = input.file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const uniquePath = `${userId}/questions/${Date.now()}-${sanitizedName}`;

  // 1. Upload to Supabase Storage
  const { error: uploadError } = await sb.storage
    .from(BUCKET_NAME)
    .upload(uniquePath, input.file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Question upload failed: ${uploadError.message}`);
  }

  // 2. Write metadata to database
  const { data, error: dbError } = await sb
    .from("question_bank")
    .insert({
      user_id: userId,
      course_code: input.courseCode.trim().toUpperCase(),
      course_name: input.courseName.trim(),
      semester_label: input.semesterLabel?.trim() || null,
      exam_type: input.examType,
      year: input.year,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      file_path: uniquePath,
      file_name: input.file.name,
      file_size: input.file.size,
      mime_type: input.file.type,
      tags: input.tags,
      is_public: input.isPublic,
    })
    .select()
    .single();

  if (dbError) {
    // Cleanup storage upload if DB insert fails
    await sb.storage.from(BUCKET_NAME).remove([uniquePath]);
    throw dbError;
  }

  return {
    id: data.id,
    userId: data.user_id,
    courseCode: data.course_code,
    courseName: data.course_name,
    semesterLabel: data.semester_label ?? undefined,
    examType: data.exam_type as QuestionBankItem["examType"],
    year: data.year,
    title: data.title,
    description: data.description ?? undefined,
    filePath: data.file_path,
    fileName: data.file_name,
    fileSize: data.file_size,
    mimeType: data.mime_type,
    tags: (data.tags as string[]) ?? [],
    isPublic: !!data.is_public,
    downloadsCount: data.downloads_count ?? 0,
    createdAt: data.created_at,
  };
}

export async function deleteQuestion(item: QuestionBankItem): Promise<void> {
  const sb = getSupabase();

  // 1. Delete from Supabase Storage
  const { error: storageError } = await sb.storage
    .from(BUCKET_NAME)
    .remove([item.filePath]);

  if (storageError) {
    console.warn("Storage deletion warning:", storageError.message);
  }

  // 2. Delete from DB registry
  const { error: dbError } = await sb
    .from("question_bank")
    .delete()
    .eq("id", item.id);

  if (dbError) throw dbError;
}

export async function getQuestionDownloadUrl(filePath: string): Promise<string> {
  const { data, error } = await getSupabase()
    .storage.from(BUCKET_NAME)
    .createSignedUrl(filePath, 300); // 5 minutes expiry for larger downloads

  if (error) throw error;
  if (!data?.signedUrl) throw new Error("Could not generate download URL");
  return data.signedUrl;
}

export async function incrementQuestionDownloads(id: string): Promise<void> {
  const sb = getSupabase();
  
  // Directly trigger download count increments on the DB
  const { error } = await sb.rpc("increment_downloads_counter", { row_id: id });
  
  if (error) {
    // Fallback: regular update if RPC function isn't defined
    const { data: current } = await sb.from("question_bank").select("downloads_count").eq("id", id).single();
    if (current) {
      await sb.from("question_bank")
        .update({ downloads_count: (current.downloads_count || 0) + 1 })
        .eq("id", id);
    }
  }
}
