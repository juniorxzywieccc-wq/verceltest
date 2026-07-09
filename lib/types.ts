export type MuscleGroup = string;

export interface SetEntry {
  id: string;
  reps: number;
  weight: number; // kg, supports decimals e.g. 17.5
}

export interface WorkoutExercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  sets: SetEntry[];
  order: number;
}

export interface WorkoutSession {
  id: string;
  date: string; // ISO date, yyyy-mm-dd
  createdAt: number;
  updatedAt: number;
  notes: string;
  exercises: WorkoutExercise[];
  planDayId?: string | null;
}

export interface PlanExercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  suggestedSets: number;
  suggestedReps: number;
  suggestedWeight?: number; // kg, optional — starsze plany/kopie zapasowe mogą go nie mieć
  order: number;
}

export interface PlanDay {
  id: string;
  name: string;
  order: number;
  exercises: PlanExercise[];
}

export interface AppSettings {
  id: string; // fixed key "app"
  theme: "dark" | "light";
  muscleGroups: string[];
  restTimerDefault: number; // seconds
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface BackupPayload {
  version: 1;
  exportedAt: string;
  sessions: WorkoutSession[];
  planDays: PlanDay[];
  settings: AppSettings;
}
