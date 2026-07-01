"use client";

import { useState } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import type { WorkoutSession } from "@/lib/types";
import { formatDatePL, formatWeekdayPL, formatSetsSummary } from "@/lib/format";

export default function SessionCard({
  session,
  onDelete,
}: {
  session: WorkoutSession;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const groups = Array.from(new Set(session.exercises.map((e) => e.muscleGroup)));

  return (
    <div className="overflow-hidden rounded-2xl border border-base-800/10 bg-base-800/[0.03] dark:border-white/10 dark:bg-white/[0.03]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <div className="min-w-0">
          <p className="font-display text-base font-semibold">
            {formatWeekdayPL(session.date)}, {formatDatePL(session.date)}
          </p>
          <p className="mt-0.5 truncate text-xs text-base-800/50 dark:text-white/40">
            {session.exercises.length}{" "}
            {session.exercises.length === 1 ? "ćwiczenie" : "ćwiczeń"}
            {groups.length > 0 ? ` · ${groups.join(", ")}` : ""}
          </p>
        </div>
        <ChevronDown
          size={18}
          className={`shrink-0 text-base-800/40 transition-transform dark:text-white/35 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="flex flex-col gap-3 border-t border-base-800/10 p-4 dark:border-white/10">
          {session.exercises.length === 0 && (
            <p className="text-xs text-base-800/40 dark:text-white/30">Brak ćwiczeń.</p>
          )}
          {session.exercises
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((ex) => (
              <div key={ex.id} className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{ex.name}</p>
                  <span className="text-[11px] text-accent">{ex.muscleGroup}</span>
                </div>
                <p className="tnum text-right text-sm text-base-800/60 dark:text-white/50">
                  {formatSetsSummary(ex.sets)}
                </p>
              </div>
            ))}

          {session.notes && (
            <p className="rounded-lg bg-base-800/5 p-3 text-xs italic text-base-800/60 dark:bg-white/5 dark:text-white/50">
              „{session.notes}”
            </p>
          )}

          <button
            onClick={onDelete}
            className="mt-1 flex items-center justify-center gap-1.5 self-start rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 active:bg-red-500/10"
          >
            <Trash2 size={13} />
            Usuń trening
          </button>
        </div>
      )}
    </div>
  );
}
