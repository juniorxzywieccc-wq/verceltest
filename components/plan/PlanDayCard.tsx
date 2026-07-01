"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Trash2, ChevronsUpDown } from "lucide-react";
import type { PlanDay, PlanExercise } from "@/lib/types";
import AddPlanExerciseForm from "./AddPlanExerciseForm";

interface Props {
  day: PlanDay;
  isFirst: boolean;
  isLast: boolean;
  onMove: (direction: -1 | 1) => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  onAddExercise: (name: string, muscleGroup: string, sets: number, reps: number) => void;
  onRemoveExercise: (exerciseId: string) => void;
  onMoveExercise: (exerciseId: string, direction: -1 | 1) => void;
  muscleGroups: string[];
  onAddMuscleGroup: (group: string) => void;
}

export default function PlanDayCard({
  day,
  isFirst,
  isLast,
  onMove,
  onRename,
  onDelete,
  onAddExercise,
  onRemoveExercise,
  onMoveExercise,
  muscleGroups,
  onAddMuscleGroup,
}: Props) {
  const [expanded, setExpanded] = useState(true);
  const sortedExercises = day.exercises.slice().sort((a, b) => a.order - b.order);

  return (
    <div className="overflow-hidden rounded-2xl border border-base-800/10 bg-base-800/[0.03] dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-center gap-2 p-4">
        <div className="flex flex-col">
          <button
            onClick={() => onMove(-1)}
            disabled={isFirst}
            aria-label="Przenieś dzień wyżej"
            className="p-0.5 text-base-800/30 disabled:opacity-20 dark:text-white/25"
          >
            <ChevronUp size={16} />
          </button>
          <button
            onClick={() => onMove(1)}
            disabled={isLast}
            aria-label="Przenieś dzień niżej"
            className="p-0.5 text-base-800/30 disabled:opacity-20 dark:text-white/25"
          >
            <ChevronDown size={16} />
          </button>
        </div>

        <input
          value={day.name}
          onChange={(e) => onRename(e.target.value)}
          className="font-display flex-1 bg-transparent text-lg font-semibold outline-none"
          placeholder="Nazwa dnia (np. Dzień A – Klata/Triceps)"
        />

        <button
          onClick={() => setExpanded((v) => !v)}
          aria-label="Zwiń / rozwiń"
          className="rounded-full p-2 text-base-800/40 dark:text-white/35"
        >
          <ChevronsUpDown size={16} />
        </button>
        <button
          onClick={onDelete}
          aria-label={`Usuń dzień ${day.name}`}
          className="rounded-full p-2 text-base-800/30 active:bg-red-500/10 active:text-red-500 dark:text-white/25"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {expanded && (
        <div className="flex flex-col gap-2 border-t border-base-800/10 p-4 dark:border-white/10">
          {sortedExercises.length === 0 && (
            <p className="pb-1 text-center text-xs text-base-800/40 dark:text-white/30">
              Brak ćwiczeń w tym dniu.
            </p>
          )}
          {sortedExercises.map((ex, idx) => (
            <PlanExerciseRow
              key={ex.id}
              exercise={ex}
              isFirst={idx === 0}
              isLast={idx === sortedExercises.length - 1}
              onMove={(dir) => onMoveExercise(ex.id, dir)}
              onRemove={() => onRemoveExercise(ex.id)}
            />
          ))}
          <AddPlanExerciseForm
            muscleGroups={muscleGroups}
            onAdd={onAddExercise}
            onAddMuscleGroup={onAddMuscleGroup}
          />
        </div>
      )}
    </div>
  );
}

function PlanExerciseRow({
  exercise,
  isFirst,
  isLast,
  onMove,
  onRemove,
}: {
  exercise: PlanExercise;
  isFirst: boolean;
  isLast: boolean;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-base-800/5 px-3 py-2.5 dark:bg-white/5">
      <div className="flex flex-col">
        <button
          onClick={() => onMove(-1)}
          disabled={isFirst}
          aria-label="Przenieś ćwiczenie wyżej"
          className="p-0.5 text-base-800/30 disabled:opacity-20 dark:text-white/25"
        >
          <ChevronUp size={13} />
        </button>
        <button
          onClick={() => onMove(1)}
          disabled={isLast}
          aria-label="Przenieś ćwiczenie niżej"
          className="p-0.5 text-base-800/30 disabled:opacity-20 dark:text-white/25"
        >
          <ChevronDown size={13} />
        </button>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{exercise.name}</p>
        <p className="text-xs text-base-800/45 dark:text-white/35">
          {exercise.muscleGroup} · {exercise.suggestedSets}×{exercise.suggestedReps}
        </p>
      </div>
      <button
        onClick={onRemove}
        aria-label={`Usuń ${exercise.name}`}
        className="rounded-full p-1.5 text-base-800/30 active:bg-red-500/10 active:text-red-500 dark:text-white/25"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
