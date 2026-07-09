"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronUp, ChevronDown, Trash2, ChevronsUpDown } from "lucide-react";
import type { PlanDay, PlanExercise } from "@/lib/types";
import AddPlanExerciseForm from "./AddPlanExerciseForm";
import NumberField from "@/components/NumberField";
import { useDebouncedCallback } from "@/lib/useDebouncedCallback";

interface Props {
  day: PlanDay;
  isFirst: boolean;
  isLast: boolean;
  onMove: (direction: -1 | 1) => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  onAddExercise: (name: string, muscleGroup: string, sets: number, reps: number, weight: number) => void;
  onRemoveExercise: (exerciseId: string) => void;
  onMoveExercise: (exerciseId: string, direction: -1 | 1) => void;
  onUpdateExercise: (
    exerciseId: string,
    patch: Partial<Pick<PlanExercise, "suggestedSets" | "suggestedReps" | "suggestedWeight">>
  ) => void;
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
  onUpdateExercise,
  muscleGroups,
  onAddMuscleGroup,
}: Props) {
  const [expanded, setExpanded] = useState(true);
  const [nameDraft, setNameDraft] = useState(day.name);
  const isEditingName = useRef(false);
  const { run: scheduleRename } = useDebouncedCallback(onRename, 350);
  const sortedExercises = day.exercises.slice().sort((a, b) => a.order - b.order);

  // Keep the input in sync if the name changes from outside (e.g. importing a
  // backup) while we're not actively typing in it.
  useEffect(() => {
    if (!isEditingName.current) setNameDraft(day.name);
  }, [day.name]);

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
          value={nameDraft}
          onFocus={() => {
            isEditingName.current = true;
          }}
          onBlur={() => {
            isEditingName.current = false;
          }}
          onChange={(e) => {
            setNameDraft(e.target.value);
            scheduleRename(e.target.value);
          }}
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
              onUpdate={(patch) => onUpdateExercise(ex.id, patch)}
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
  onUpdate,
}: {
  exercise: PlanExercise;
  isFirst: boolean;
  isLast: boolean;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  onUpdate: (
    patch: Partial<Pick<PlanExercise, "suggestedSets" | "suggestedReps" | "suggestedWeight">>
  ) => void;
}) {
  // Local, optimistic copy of the editable fields. The row is remounted
  // whenever its exercise id changes (see key={ex.id} in the parent), so
  // seeding state once from props here is safe. We update this immediately
  // on every keystroke so the field always shows what you typed — even the
  // instant you tab away — while the actual write to IndexedDB is debounced
  // separately so fast typing doesn't hammer the DB.
  const [localSets, setLocalSets] = useState(exercise.suggestedSets);
  const [localReps, setLocalReps] = useState(exercise.suggestedReps);
  const [localWeight, setLocalWeight] = useState(exercise.suggestedWeight ?? 0);

  const { run: scheduleSets } = useDebouncedCallback(
    (v: number) => onUpdate({ suggestedSets: v }),
    350
  );
  const { run: scheduleReps } = useDebouncedCallback(
    (v: number) => onUpdate({ suggestedReps: v }),
    350
  );
  const { run: scheduleWeight } = useDebouncedCallback(
    (v: number) => onUpdate({ suggestedWeight: v }),
    350
  );

  return (
    <div className="rounded-xl bg-base-800/5 px-3 py-2.5 dark:bg-white/5">
      <div className="flex items-center gap-2">
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
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{exercise.name}</p>
          <span className="text-[11px] text-accent">{exercise.muscleGroup}</span>
        </div>
        <button
          onClick={onRemove}
          aria-label={`Usuń ${exercise.name}`}
          className="rounded-full p-1.5 text-base-800/30 active:bg-red-500/10 active:text-red-500 dark:text-white/25"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2 pl-[22px]">
        <NumberField
          label="Serie"
          mode="numeric"
          value={localSets}
          onChange={(v) => {
            const next = v || 1;
            setLocalSets(next);
            scheduleSets(next);
          }}
        />
        <NumberField
          label="Powt."
          mode="numeric"
          value={localReps}
          onChange={(v) => {
            const next = v || 1;
            setLocalReps(next);
            scheduleReps(next);
          }}
        />
        <NumberField
          label="Kg"
          mode="decimal"
          value={localWeight}
          onChange={(v) => {
            setLocalWeight(v);
            scheduleWeight(v);
          }}
        />
      </div>
    </div>
  );
}
