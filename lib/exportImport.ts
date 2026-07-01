import { db, ensureSettings } from "./db";
import type { BackupPayload } from "./types";

export async function exportBackup(): Promise<void> {
  const [sessions, planDays, settings] = await Promise.all([
    db.sessions.toArray(),
    db.planDays.toArray(),
    ensureSettings(),
  ]);

  const payload: BackupPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    sessions,
    planDays,
    settings,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = payload.exportedAt.slice(0, 10);
  a.href = url;
  a.download = `dziennik-treningowy-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function importBackup(file: File): Promise<{ sessions: number; planDays: number }> {
  const text = await file.text();
  const data = JSON.parse(text) as BackupPayload;

  if (!data || !Array.isArray(data.sessions) || !Array.isArray(data.planDays)) {
    throw new Error("Nieprawidłowy plik kopii zapasowej.");
  }

  await db.transaction("rw", db.sessions, db.planDays, db.settings, async () => {
    await db.sessions.clear();
    await db.planDays.clear();
    if (data.sessions.length) await db.sessions.bulkPut(data.sessions);
    if (data.planDays.length) await db.planDays.bulkPut(data.planDays);
    if (data.settings) await db.settings.put({ ...data.settings, id: "app" });
  });

  return { sessions: data.sessions.length, planDays: data.planDays.length };
}
