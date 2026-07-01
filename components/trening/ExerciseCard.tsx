"use client";

import { Plus, Trash2, GripVertical } from "lucide-react";
import type { WorkoutExercise, SetEntry } from "@/lib/types";
import NumberField from "@/components/NumberField";
import { formatSetsSummary, formatDateShortPL } from "@/lib/format";

interface Props {
  exercise: WorkoutExercise;
  previous?: { date: string; sets: SetEntry[] } | null;
  onAddSet: () => void;
  onRemoveSet: (setId: string) => void;
  onChangeSet: (setId: string, patch: Partial<Pick<SetEntry, "reps" | "weight">>) => void;
  onRemoveExercise: () => void;
}

export default function ExerciseCard({
  exercise,
  previous,
  onAddSet,
  onRemoveSet,
  onChangeSet,
  onRemoveExercise,
}: Props) {
  return (
    <div className="rounded-2xl border border-base-800/10 bg-base-800/[0.03] p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <GripVertical size={14} className="text-base-800/20 dark:text-white/20" />
            <h3 className="font-display text-base font-semibold leading-tight">{exercise.name}</h3>
          </div>
          <span className="ml-5 inline-block rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
            {exercise.muscleGroup}
          </span>
        </div>
        <button
          onClick={onRemoveExercise}
          aria-label={`Usuń ${exercise.name}`}
          className="rounded-full p-2 text-base-800/30 active:bg-red-500/10 active:text-red-500 dark:text-white/25"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {previous && previous.sets.length > 0 && (
        <p className="mb-3 ml-5 text-xs text-base-800/50 dark:text-white/40">
          Ostatnio ({formatDateShortPL(previous.date)}): {formatSetsSummary(previous.sets)}
        </p>
      )}

      <div className="ml-5 flex flex-col gap-2">
        {exercise.sets.length > 0 && (
          <div className="grid grid-cols-[24px_1fr_1fr_36px] items-center gap-2 px-1 text-[10px] font-medium uppercase tracking-wide text-base-800/35 dark:text-white/30">
            <span>#</span>
            <span className="text-center">Powtórzenia</span>
            <span className="text-center">Ciężar (kg)</span>
            <span />
          </div>
        )}
        {exercise.sets.map((set, idx) => (
          <div key={set.id} className="grid grid-cols-[24px_1fr_1fr_36px] items-center gap-2">
            <span className="tnum text-center text-sm font-medium text-base-800/40 dark:text-white/35">
              {idx + 1}
            </span>
            <NumberField
              mode="numeric"
              value={set.reps}
              onChange={(v) => onChangeSet(set.id, { reps: v })}
            />
            <NumberField
              mode="decimal"
              value={set.weight}
              onChange={(v) => onChangeSet(set.id, { weight: v })}
            />
            <button
              onClick={() => onRemoveSet(set.id)}
              aria-label="Usuń serię"
              className="flex h-9 w-9 items-center justify-center rounded-full text-base-800/25 active:bg-red-500/10 active:text-red-500 dark:text-white/25"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}

        <button
          onClick={onAddSet}
          className="mt-1 flex h-11 items-center justify-center gap-1.5 rounded-xl border border-dashed border-accent/40 text-sm font-medium text-accent active:bg-accent/10"
        >
          <Plus size={16} />
          Seria
        </button>
      </div>
    </div>
  );
}
