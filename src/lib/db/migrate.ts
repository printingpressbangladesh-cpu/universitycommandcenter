import { db } from "./index";

/** Marks user as initialized — no demo data is ever inserted. */
export async function ensureUserData(userId: string) {
  const flag = await db.meta.get(`init:${userId}`);
  if (!flag) {
    await db.meta.put({ key: `init:${userId}`, migratedAt: new Date().toISOString() });
  }
}
