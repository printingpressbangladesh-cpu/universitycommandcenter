import { deleteAllUserData } from "@/lib/supabase/data";

export async function resetUserData(userId: string) {
  await deleteAllUserData(userId);
}
