"use client";

import { useState } from "react";
import { ListPlus } from "lucide-react";
import type { PlanDay } from "@/lib/types";

interface Props {
  planDays: PlanDay[];
  onLoad: (day: PlanDay) => void;
}

export default function LoadPlanControl({ planDays, onLoad }: Props) {
  const [open, setOpen] = useState(false);

  if (planDays.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-accent/40 text-sm font-medium text-accent active:bg-accent/10"
      >
        <ListPlus size={17} />
        Wczytaj dzień z planu
      </button>
      {open && (
        <div className="absolute inset-x-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-xl border border-base-800/10 bg-base-50 shadow-card dark:border-white/10 dark:bg-base-900">
          {planDays.map((day) => (
            <button
              key={day.id}
              onClick={() => {
                onLoad(day);
                setOpen(false);
              }}
              className="flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left active:bg-base-800/5 dark:active:bg-white/5"
            >
              <span className="text-sm font-medium">{day.name}</span>
              <span className="text-xs text-base-800/45 dark:text-white/35">
                {day.exercises.length} {day.exercises.length === 1 ? "ćwiczenie" : "ćwiczeń"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
