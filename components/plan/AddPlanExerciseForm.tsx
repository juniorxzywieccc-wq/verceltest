"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import NumberField from "@/components/NumberField";

interface Props {
  muscleGroups: string[];
  onAdd: (name: string, muscleGroup: string, sets: number, reps: number, weight: number) => void;
  onAddMuscleGroup: (group: string) => void;
}

export default function AddPlanExerciseForm({ muscleGroups, onAdd, onAddMuscleGroup }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [group, setGroup] = useState(muscleGroups[0] ?? "Klata");
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(0);
  const [newGroup, setNewGroup] = useState("");
  const [addingGroup, setAddingGroup] = useState(false);

  const reset = () => {
    setName("");
    setSets(3);
    setReps(10);
    setWeight(0);
    setNewGroup("");
    setAddingGroup(false);
    setOpen(false);
  };

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    let finalGroup = group;
    if (addingGroup && newGroup.trim()) {
      finalGroup = newGroup.trim();
      onAddMuscleGroup(finalGroup);
    }
    onAdd(trimmed, finalGroup, sets || 1, reps || 1, weight || 0);
    reset();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-accent/50 text-sm font-medium text-accent active:bg-accent/10"
      >
        <Plus size={16} />
        Dodaj ćwiczenie do dnia
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-base-800/10 bg-base-800/[0.03] p-3 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-base-800/60 dark:text-white/50">Nowe ćwiczenie</span>
        <button onClick={reset} className="text-base-800/40 dark:text-white/40">
          <X size={16} />
        </button>
      </div>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="np. Przysiad ze sztangą"
        className="mb-2 h-11 w-full rounded-lg border border-base-800/10 bg-transparent px-3 text-sm outline-none focus:border-accent dark:border-white/10"
      />

      {!addingGroup ? (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {muscleGroups.map((g) => (
            <button
              key={g}
              onClick={() => setGroup(g)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                group === g
                  ? "bg-accent text-white"
                  : "bg-base-800/8 text-base-800/60 dark:bg-white/8 dark:text-white/60"
              }`}
            >
              {g}
            </button>
          ))}
          <button
            onClick={() => setAddingGroup(true)}
            className="rounded-full border border-dashed border-accent/50 px-2.5 py-1 text-xs font-medium text-accent"
          >
            + Nowa
          </button>
        </div>
      ) : (
        <div className="mb-2 flex items-center gap-2">
          <input
            autoFocus
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
            placeholder="Nazwa partii"
            className="h-10 flex-1 rounded-lg border border-base-800/10 bg-transparent px-3 text-sm outline-none focus:border-accent dark:border-white/10"
          />
          <button
            onClick={() => setAddingGroup(false)}
            className="text-xs font-medium text-base-800/50 dark:text-white/40"
          >
            Anuluj
          </button>
        </div>
      )}

      <div className="mb-3 grid grid-cols-3 gap-2">
        <NumberField label="Serie" value={sets} onChange={setSets} mode="numeric" />
        <NumberField label="Powt." value={reps} onChange={setReps} mode="numeric" />
        <NumberField label="Kg" value={weight} onChange={setWeight} mode="decimal" />
      </div>

      <button
        onClick={submit}
        disabled={!name.trim()}
        className="h-10 w-full rounded-lg bg-accent text-sm font-semibold text-white disabled:opacity-40"
      >
        Dodaj
      </button>
    </div>
  );
}
