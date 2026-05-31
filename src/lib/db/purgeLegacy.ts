import { db, isDbAvailable } from "./index";

const PURGE_KEY = "purged-legacy-demo-v2";

/**
 * One-time wipe of leftover demo courses/assignments saved in IndexedDB
 * before the app stopped seeding sample data.
 */
export async function purgeLegacyDemoDataOnce(): Promise<boolean> {
  if (!isDbAvailable()) return false;
  if (await db.meta.get(PURGE_KEY)) return false;

  await Promise.all([
    db.courses.clear(),
    db.assignments.clear(),
    db.notes.clear(),
    db.routines.clear(),
    db.examDates.clear(),
    db.examChecklist.clear(),
    db.exams.clear(),
  ]);

  const metas = await db.meta.toArray();
  await Promise.all(
    metas
      .filter((m) => m.key.startsWith("seeded:") || m.key.startsWith("init:"))
      .map((m) => db.meta.delete(m.key)),
  );

  await db.meta.put({ key: PURGE_KEY, migratedAt: new Date().toISOString() });
  return true;
}
