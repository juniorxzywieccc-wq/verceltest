import Dexie, { type Table } from "dexie";
import type { WorkoutSession, PlanDay, AppSettings } from "./types";

export const DEFAULT_MUSCLE_GROUPS = [
  "Klata",
  "Plecy",
  "Biceps",
  "Triceps",
  "Barki",
  "Nogi",
  "Brzuch",
];

export const DEFAULT_SETTINGS: AppSettings = {
  id: "app",
  theme: "dark",
  muscleGroups: DEFAULT_MUSCLE_GROUPS,
  restTimerDefault: 90,
  soundEnabled: true,
  vibrationEnabled: true,
};

class WorkoutDB extends Dexie {
  sessions!: Table<WorkoutSession, string>;
  planDays!: Table<PlanDay, string>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super("dziennik-treningowy");
    this.version(1).stores({
      sessions: "id, date, updatedAt",
      planDays: "id, order",
      settings: "id",
    });
  }
}

export const db = typeof window !== "undefined" ? new WorkoutDB() : (null as unknown as WorkoutDB);

export async function ensureSettings(): Promise<AppSettings> {
  const existing = await db.settings.get("app");
  if (existing) return existing;
  await db.settings.put(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function todayISO(): string {
  const d = new Date();
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10);
}
