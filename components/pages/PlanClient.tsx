"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { Plus } from "lucide-react";
import { db, uid, ensureSettings } from "@/lib/db";
import type { PlanDay } from "@/lib/types";
import TopBar from "@/components/TopBar";
import PlanDayCard from "@/components/plan/PlanDayCard";
import { useSettings } from "@/lib/useSettings";
import { useToast } from "@/lib/ToastProvider";

export default function PlanClient() {
  const planDays = useLiveQuery(() => db.planDays.orderBy("order").toArray(), []) ?? [];
  const settings = useSettings();
  const { showToast } = useToast();

  const addDay = async () => {
    const day: PlanDay = {
      id: uid(),
      name: `Dzień ${String.fromCharCode(65 + planDays.length)}`,
      order: planDays.length,
      exercises: [],
    };
    await db.planDays.put(day);
    showToast("Dodano dzień ✓");
  };

  const renameDay = (day: PlanDay, name: string) => {
    db.planDays.put({ ...day, name });
  };

  const deleteDay = async (day: PlanDay) => {
    await db.planDays.delete(day.id);
    const remaining = planDays.filter((d) => d.id !== day.id);
    await Promise.all(remaining.map((d, idx) => db.planDays.update(d.id, { order: idx })));
    showToast("Usunięto dzień");
  };

  const moveDay = async (day: PlanDay, direction: -1 | 1) => {
    const sorted = planDays.slice().sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((d) => d.id === day.id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    await db.planDays.update(day.id, { order: other.order });
    await db.planDays.update(other.id, { order: day.order });
  };

  const addExercise = (
    day: PlanDay,
    name: string,
    muscleGroup: string,
    sets: number,
    reps: number
  ) => {
    const newExercise = {
      id: uid(),
      name,
      muscleGroup,
      suggestedSets: sets,
      suggestedReps: reps,
      order: day.exercises.length,
    };
    db.planDays.put({ ...day, exercises: [...day.exercises, newExercise] });
    showToast("Dodano ćwiczenie ✓");
  };

  const removeExercise = (day: PlanDay, exerciseId: string) => {
    db.planDays.put({
      ...day,
      exercises: day.exercises.filter((e) => e.id !== exerciseId),
    });
  };

  const moveExercise = (day: PlanDay, exerciseId: string, direction: -1 | 1) => {
    const sorted = day.exercises.slice().sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((e) => e.id === exerciseId);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const reordered = sorted.map((e) => ({ ...e }));
    const tmp = reordered[idx].order;
    reordered[idx].order = reordered[swapIdx].order;
    reordered[swapIdx].order = tmp;
    db.planDays.put({ ...day, exercises: reordered });
  };

  const addMuscleGroup = async (group: string) => {
    const current = await ensureSettings();
    if (!current.muscleGroups.includes(group)) {
      await db.settings.put({ ...current, muscleGroups: [...current.muscleGroups, group] });
    }
  };

  const sortedDays = planDays.slice().sort((a, b) => a.order - b.order);

  return (
    <div>
      <TopBar title="Plan" subtitle="Twój podział treningowy" />

      <div className="flex flex-col gap-3 px-4 pt-4 pb-6">
        {sortedDays.length === 0 && (
          <div className="rounded-2xl border border-dashed border-base-800/15 px-4 py-8 text-center text-sm text-base-800/40 dark:border-white/15 dark:text-white/35">
            Nie masz jeszcze żadnego dnia planu. Dodaj pierwszy, np. „Dzień A – Klata/Triceps”.
          </div>
        )}

        {sortedDays.map((day, idx) => (
          <PlanDayCard
            key={day.id}
            day={day}
            isFirst={idx === 0}
            isLast={idx === sortedDays.length - 1}
            onMove={(dir) => moveDay(day, dir)}
            onRename={(name) => renameDay(day, name)}
            onDelete={() => deleteDay(day)}
            onAddExercise={(name, group, sets, reps) => addExercise(day, name, group, sets, reps)}
            onRemoveExercise={(exId) => removeExercise(day, exId)}
            onMoveExercise={(exId, dir) => moveExercise(day, exId, dir)}
            muscleGroups={settings.muscleGroups}
            onAddMuscleGroup={addMuscleGroup}
          />
        ))}

        <button
          onClick={addDay}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-white active:scale-[0.98]"
        >
          <Plus size={18} />
          Dodaj dzień planu
        </button>
      </div>
    </div>
  );
}
