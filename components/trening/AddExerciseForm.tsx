"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

interface Props {
  muscleGroups: string[];
  onAdd: (name: string, muscleGroup: string) => void;
  onAddMuscleGroup: (group: string) => void;
}

export default function AddExerciseForm({ muscleGroups, onAdd, onAddMuscleGroup }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [group, setGroup] = useState(muscleGroups[0] ?? "Klata");
  const [newGroup, setNewGroup] = useState("");
  const [addingGroup, setAddingGroup] = useState(false);

  const reset = () => {
    setName("");
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
    onAdd(trimmed, finalGroup);
    reset();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-white active:scale-[0.98]"
      >
        <Plus size={18} />
        Dodaj ćwiczenie
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-base-800/10 bg-base-800/[0.03] p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Nowe ćwiczenie</h3>
        <button onClick={reset} aria-label="Zamknij" className="text-base-800/40 dark:text-white/40">
          <X size={18} />
        </button>
      </div>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="np. Wyciskanie sztangi"
        className="mb-3 h-12 w-full rounded-xl border border-base-800/10 bg-transparent px-3 text-sm outline-none focus:border-accent dark:border-white/10"
      />

      {!addingGroup ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {muscleGroups.map((g) => (
            <button
              key={g}
              onClick={() => setGroup(g)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
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
            className="rounded-full border border-dashed border-accent/50 px-3 py-1.5 text-xs font-medium text-accent"
          >
            + Nowa partia
          </button>
        </div>
      ) : (
        <div className="mb-3 flex items-center gap-2">
          <input
            autoFocus
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
            placeholder="Nazwa partii mięśniowej"
            className="h-11 flex-1 rounded-xl border border-base-800/10 bg-transparent px-3 text-sm outline-none focus:border-accent dark:border-white/10"
          />
          <button
            onClick={() => setAddingGroup(false)}
            className="text-xs font-medium text-base-800/50 dark:text-white/40"
          >
            Anuluj
          </button>
        </div>
      )}

      <button
        onClick={submit}
        disabled={!name.trim()}
        className="h-11 w-full rounded-xl bg-accent text-sm font-semibold text-white disabled:opacity-40"
      >
        Dodaj do treningu
      </button>
    </div>
  );
}
