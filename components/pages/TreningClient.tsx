"use client";

import { useCallback, useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { db, uid, todayISO, ensureSettings } from "@/lib/db";
import type { WorkoutSession, WorkoutExercise, SetEntry, PlanDay } from "@/lib/types";
import TopBar from "@/components/TopBar";
import RestTimer from "@/components/RestTimer";
import ExerciseCard from "@/components/trening/ExerciseCard";
import AddExerciseForm from "@/components/trening/AddExerciseForm";
import LoadPlanControl from "@/components/trening/LoadPlanControl";
import { useDebouncedCallback } from "@/lib/useDebouncedCallback";
import { useToast } from "@/lib/ToastProvider";
import { useSettings } from "@/lib/useSettings";
import { formatDatePL, formatWeekdayPL } from "@/lib/format";

function emptySession(date: string): WorkoutSession {
  const now = Date.now();
  return { id: date, date, createdAt: now, updatedAt: now, notes: "", exercises: [], planDayId: null };
}

function shiftDate(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function TreningClient() {
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());
  // IMPORTANT: db.sessions.get() resolves to `undefined` both while dexie-react-hooks
  // is still loading AND when there simply is no saved session for that date (the normal
  // case for any day you haven't saved yet). Those two states are indistinguishable if we
  // return `undefined` directly, so the effect below would think "still loading" forever
  // and the page would get stuck on "Ładowanie…". We use `null` as an explicit
  // "loaded, but nothing there" sentinel so it stays different from "not loaded yet".
  const dbSession = useLiveQuery(
    async () => (await db.sessions.get(selectedDate)) ?? null,
    [selectedDate]
  );
  const allSessions = useLiveQuery(() => db.sessions.toArray(), []) ?? [];
  const planDays = useLiveQuery(() => db.planDays.orderBy("order").toArray(), []) ?? [];
  const settings = useSettings();
  const { showToast } = useToast();

  const [draft, setDraft] = useState<WorkoutSession | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  useEffect(() => {
    if (dbSession === undefined) return; // still loading from IndexedDB
    const key = selectedDate;
    if (loadedKey === key) return;
    setDraft(dbSession ?? emptySession(selectedDate)); // dbSession is null when no session was saved yet
    setLoadedKey(key);
  }, [dbSession, selectedDate, loadedKey]);

  const { run: scheduleSave, flush: flushSave } = useDebouncedCallback(
    (session: WorkoutSession) => {
      db.sessions.put(session);
    },
    400
  );

  useEffect(() => {
    return () => flushSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const commit = useCallback(
    (updater: (s: WorkoutSession) => WorkoutSession, toast?: string) => {
      setDraft((prev) => {
        if (!prev) return prev;
        const next = updater({ ...prev, updatedAt: Date.now() });
        scheduleSave(next);
        return next;
      });
      if (toast) showToast(toast);
    },
    [scheduleSave, showToast]
  );

  const findPrevious = useCallback(
    (exerciseName: string) => {
      const matches = allSessions
        .filter((s) => s.date < selectedDate)
        .sort((a, b) => (a.date < b.date ? 1 : -1));
      for (const s of matches) {
        const ex = s.exercises.find(
          (e) => e.name.trim().toLowerCase() === exerciseName.trim().toLowerCase()
        );
        if (ex && ex.sets.length > 0) return { date: s.date, sets: ex.sets };
      }
      return null;
    },
    [allSessions, selectedDate]
  );

  const addExercise = (name: string, muscleGroup: string) => {
    commit((s) => {
      const newExercise: WorkoutExercise = {
        id: uid(),
        name,
        muscleGroup,
        sets: [],
        order: s.exercises.length,
      };
      return { ...s, exercises: [...s.exercises, newExercise] };
    }, "Dodano ćwiczenie ✓");
  };

  const addMuscleGroup = async (group: string) => {
    const current = await ensureSettings();
    if (!current.muscleGroups.includes(group)) {
      await db.settings.put({ ...current, muscleGroups: [...current.muscleGroups, group] });
    }
  };

  const removeExercise = (exerciseId: string) => {
    commit(
      (s) => ({ ...s, exercises: s.exercises.filter((e) => e.id !== exerciseId) }),
      "Usunięto ćwiczenie"
    );
  };

  const addSet = (exerciseId: string) => {
    commit((s) => ({
      ...s,
      exercises: s.exercises.map((e) => {
        if (e.id !== exerciseId) return e;
        const last = e.sets[e.sets.length - 1];
        const newSet: SetEntry = {
          id: uid(),
          reps: last?.reps ?? 8,
          weight: last?.weight ?? 0,
        };
        return { ...e, sets: [...e.sets, newSet] };
      }),
    }), "Zapisano ✓");
  };

  const removeSet = (exerciseId: string, setId: string) => {
    commit((s) => ({
      ...s,
      exercises: s.exercises.map((e) =>
        e.id === exerciseId ? { ...e, sets: e.sets.filter((st) => st.id !== setId) } : e
      ),
    }));
  };

  const changeSet = (
    exerciseId: string,
    setId: string,
    patch: Partial<Pick<SetEntry, "reps" | "weight">>
  ) => {
    commit((s) => ({
      ...s,
      exercises: s.exercises.map((e) =>
        e.id === exerciseId
          ? {
              ...e,
              sets: e.sets.map((st) => (st.id === setId ? { ...st, ...patch } : st)),
            }
          : e
      ),
    }));
  };

  const loadPlanDay = (day: PlanDay) => {
    commit((s) => {
      const existingNames = new Set(s.exercises.map((e) => e.name.trim().toLowerCase()));
      const toAdd: WorkoutExercise[] = day.exercises
        .filter((pe) => !existingNames.has(pe.name.trim().toLowerCase()))
        .map((pe, idx) => {
          const previous = findPrevious(pe.name);
          const lastWeight = previous?.sets[previous.sets.length - 1]?.weight ?? 0;
          const sets: SetEntry[] = Array.from({ length: Math.max(1, pe.suggestedSets) }).map(
            () => ({ id: uid(), reps: pe.suggestedReps, weight: lastWeight })
          );
          return {
            id: uid(),
            name: pe.name,
            muscleGroup: pe.muscleGroup,
            sets,
            order: s.exercises.length + idx,
          };
        });
      return { ...s, exercises: [...s.exercises, ...toAdd], planDayId: day.id };
    }, "Wczytano plan ✓");
  };

  const setNotes = (notes: string) => {
    commit((s) => ({ ...s, notes }));
  };

  if (!draft) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-base-800/40 dark:text-white/30">
        Ładowanie…
      </div>
    );
  }

  const isToday = selectedDate === todayISO();

  return (
    <div>
      <TopBar
        title="Trening"
        subtitle={`${formatWeekdayPL(selectedDate)}, ${formatDatePL(selectedDate)}`}
      />

      <div className="flex items-center gap-2 px-4 pt-4">
        <button
          onClick={() => {
            flushSave();
            setLoadedKey(null);
            setSelectedDate((d) => shiftDate(d, -1));
          }}
          aria-label="Poprzedni dzień"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-base-800/5 active:scale-95 dark:bg-white/5"
        >
          <ChevronLeft size={20} />
        </button>

        <label className="relative flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-base-800/5 text-sm font-medium dark:bg-white/5">
          <Calendar size={15} className="text-base-800/40 dark:text-white/35" />
          {isToday ? "Dziś" : formatDatePL(selectedDate)}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              if (!e.target.value) return;
              flushSave();
              setLoadedKey(null);
              setSelectedDate(e.target.value);
            }}
            className="absolute inset-0 h-full w-full opacity-0"
            aria-label="Wybierz datę treningu"
          />
        </label>

        <button
          onClick={() => {
            flushSave();
            setLoadedKey(null);
            setSelectedDate((d) => shiftDate(d, 1));
          }}
          aria-label="Następny dzień"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-base-800/5 active:scale-95 dark:bg-white/5"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="flex flex-col gap-3 px-4 pt-4">
        <LoadPlanControl planDays={planDays} onLoad={loadPlanDay} />

        {draft.exercises.length === 0 && (
          <div className="rounded-2xl border border-dashed border-base-800/15 px-4 py-8 text-center text-sm text-base-800/40 dark:border-white/15 dark:text-white/35">
            Brak ćwiczeń w tym dniu. Dodaj ćwiczenie ręcznie albo wczytaj dzień z planu.
          </div>
        )}

        {draft.exercises
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              previous={findPrevious(exercise.name)}
              onAddSet={() => addSet(exercise.id)}
              onRemoveSet={(setId) => removeSet(exercise.id, setId)}
              onChangeSet={(setId, patch) => changeSet(exercise.id, setId, patch)}
              onRemoveExercise={() => removeExercise(exercise.id)}
            />
          ))}

        <AddExerciseForm
          muscleGroups={settings.muscleGroups}
          onAdd={addExercise}
          onAddMuscleGroup={addMuscleGroup}
        />

        <div className="pb-4">
          <label className="mb-1.5 block text-xs font-medium text-base-800/50 dark:text-white/40">
            Notatka do treningu
          </label>
          <textarea
            value={draft.notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="np. dziś słabszy dzień, mało spałem"
            rows={3}
            className="w-full rounded-xl border border-base-800/10 bg-base-800/[0.03] p-3 text-sm outline-none focus:border-accent dark:border-white/10 dark:bg-white/[0.03]"
          />
        </div>
      </div>

      <RestTimer />
    </div>
  );
}
