"use client";

import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import TopBar from "@/components/TopBar";
import SessionCard from "@/components/historia/SessionCard";
import { useSettings } from "@/lib/useSettings";
import { useToast } from "@/lib/ToastProvider";

export default function HistoriaClient() {
  const sessions = useLiveQuery(() => db.sessions.orderBy("date").reverse().toArray(), []) ?? [];
  const settings = useSettings();
  const { showToast } = useToast();

  const [groupFilter, setGroupFilter] = useState<string | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      if (s.exercises.length === 0 && !s.notes) return false;
      if (groupFilter && !s.exercises.some((e) => e.muscleGroup === groupFilter)) return false;
      if (from && s.date < from) return false;
      if (to && s.date > to) return false;
      return true;
    });
  }, [sessions, groupFilter, from, to]);

  const deleteSession = async (id: string) => {
    await db.sessions.delete(id);
    showToast("Usunięto trening");
  };

  return (
    <div>
      <TopBar title="Historia" subtitle={`${filtered.length} zapisanych treningów`} />

      <div className="flex flex-col gap-3 px-4 pt-4">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setGroupFilter(null)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
              groupFilter === null
                ? "bg-accent text-white"
                : "bg-base-800/8 text-base-800/60 dark:bg-white/8 dark:text-white/60"
            }`}
          >
            Wszystkie
          </button>
          {settings.muscleGroups.map((g) => (
            <button
              key={g}
              onClick={() => setGroupFilter(g)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                groupFilter === g
                  ? "bg-accent text-white"
                  : "bg-base-800/8 text-base-800/60 dark:bg-white/8 dark:text-white/60"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-10 flex-1 rounded-lg border border-base-800/10 bg-transparent px-2 text-xs outline-none focus:border-accent dark:border-white/10"
            aria-label="Od daty"
          />
          <span className="text-xs text-base-800/40 dark:text-white/30">—</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-10 flex-1 rounded-lg border border-base-800/10 bg-transparent px-2 text-xs outline-none focus:border-accent dark:border-white/10"
            aria-label="Do daty"
          />
          {(from || to) && (
            <button
              onClick={() => {
                setFrom("");
                setTo("");
              }}
              className="text-xs font-medium text-accent"
            >
              Wyczyść
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4 pb-6 pt-4">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-base-800/15 px-4 py-8 text-center text-sm text-base-800/40 dark:border-white/15 dark:text-white/35">
            Brak treningów spełniających kryteria.
          </div>
        )}
        {filtered.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onDelete={() => deleteSession(session.id)}
          />
        ))}
      </div>
    </div>
  );
}
