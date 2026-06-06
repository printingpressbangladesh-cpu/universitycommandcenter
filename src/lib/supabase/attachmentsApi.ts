import { getSupabase } from "./client";
import type { AssignmentAttachment } from "@/lib/types";

const BUCKET_NAME = "assignment-attachments";

export async function listAttachments(assignmentId: string): Promise<AssignmentAttachment[]> {
  const { data, error } = await getSupabase()
    .from("assignment_attachments")
    .select("*")
    .eq("assignment_id", assignmentId);

  if (error) throw error;
  
  return (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    assignmentId: row.assignment_id,
    fileName: row.file_name,
    filePath: row.file_path,
    fileSize: row.file_size,
    mimeType: row.mime_type,
    createdAt: row.created_at,
  }));
}

export async function uploadAttachment(
  userId: string,
  assignmentId: string,
  file: File
): Promise<AssignmentAttachment> {
  const sb = getSupabase();
  
  // Enforce max 10MB limit
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("File exceeds the maximum size limit of 10MB");
  }

  // Generate unique file path
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const uniquePath = `${userId}/${assignmentId}/${Date.now()}-${sanitizedName}`;

  // 1. Upload to Supabase Storage
  const { error: uploadError } = await sb.storage
    .from(BUCKET_NAME)
    .upload(uniquePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  // 2. Write metadata to registry table
  const { data, error: dbError } = await sb
    .from("assignment_attachments")
    .insert({
      user_id: userId,
      assignment_id: assignmentId,
      file_name: file.name,
      file_path: uniquePath,
      file_size: file.size,
      mime_type: file.type,
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
    assignmentId: data.assignment_id,
    fileName: data.file_name,
    filePath: data.file_path,
    fileSize: data.file_size,
    mimeType: data.mime_type,
    createdAt: data.created_at,
  };
}

export async function deleteAttachment(attachment: AssignmentAttachment): Promise<void> {
  const sb = getSupabase();

  // 1. Delete from Supabase Storage
  const { error: storageError } = await sb.storage
    .from(BUCKET_NAME)
    .remove([attachment.filePath]);

  if (storageError) {
    console.warn("Storage deletion warning:", storageError.message);
  }

  // 2. Delete from registry table
  const { error: dbError } = await sb
    .from("assignment_attachments")
    .delete()
    .eq("id", attachment.id);

  if (dbError) throw dbError;
}

export async function getAttachmentDownloadUrl(filePath: string): Promise<string> {
  const { data, error } = await getSupabase()
    .storage.from(BUCKET_NAME)
    .createSignedUrl(filePath, 60); // 60 seconds expiry

  if (error) throw error;
  if (!data?.signedUrl) throw new Error("Could not generate download URL");
  return data.signedUrl;
}
