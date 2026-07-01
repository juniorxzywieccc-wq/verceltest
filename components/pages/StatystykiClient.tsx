"use client";

import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { db } from "@/lib/db";
import TopBar from "@/components/TopBar";
import NumberField from "@/components/NumberField";
import { formatDateShortPL, formatWeight } from "@/lib/format";

export default function StatystykiClient() {
  const sessions = useLiveQuery(() => db.sessions.orderBy("date").toArray(), []) ?? [];

  const exerciseNames = useMemo(() => {
    const set = new Set<string>();
    sessions.forEach((s) => s.exercises.forEach((e) => set.add(e.name)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pl"));
  }, [sessions]);

  const [selected, setSelected] = useState<string | null>(exerciseNames[0] ?? null);
  const activeExercise = selected && exerciseNames.includes(selected) ? selected : exerciseNames[0] ?? null;

  const chartData = useMemo(() => {
    if (!activeExercise) return [];
    return sessions
      .map((s) => {
        const ex = s.exercises.find((e) => e.name === activeExercise);
        if (!ex || ex.sets.length === 0) return null;
        const topSet = ex.sets.reduce((max, cur) => (cur.weight > max.weight ? cur : max), ex.sets[0]);
        return {
          date: s.date,
          label: formatDateShortPL(s.date),
          weight: topSet.weight,
          reps: topSet.reps,
        };
      })
      .filter((v): v is { date: string; label: string; weight: number; reps: number } => v !== null);
  }, [sessions, activeExercise]);

  // 1RM calculator (Epley formula), pre-filled from the most recent top set.
  const lastPoint = chartData[chartData.length - 1];
  const [rmWeight, setRmWeight] = useState(0);
  const [rmReps, setRmReps] = useState(0);

  const effectiveWeight = rmWeight || lastPoint?.weight || 0;
  const effectiveReps = rmReps || lastPoint?.reps || 1;
  const oneRepMax =
    effectiveReps <= 1 ? effectiveWeight : effectiveWeight * (1 + effectiveReps / 30);

  return (
    <div>
      <TopBar title="Statystyki" subtitle="Progres w czasie i kalkulator 1RM" />

      <div className="flex flex-col gap-4 px-4 pt-4 pb-8">
        {exerciseNames.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-base-800/15 px-4 py-8 text-center text-sm text-base-800/40 dark:border-white/15 dark:text-white/35">
            Zapisz kilka treningów, żeby zobaczyć tu swój progres.
          </div>
        ) : (
          <>
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
              {exerciseNames.map((name) => (
                <button
                  key={name}
                  onClick={() => setSelected(name)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                    activeExercise === name
                      ? "bg-accent text-white"
                      : "bg-base-800/8 text-base-800/60 dark:bg-white/8 dark:text-white/60"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-base-800/10 bg-base-800/[0.03] p-4 dark:border-white/10 dark:bg-white/[0.03]">
              <h3 className="mb-3 font-display text-sm font-semibold">
                Najcięższy ciężar na trening — {activeExercise}
              </h3>
              {chartData.length < 2 ? (
                <p className="py-6 text-center text-xs text-base-800/40 dark:text-white/30">
                  Potrzeba co najmniej 2 treningów z tym ćwiczeniem, żeby narysować wykres.
                </p>
              ) : (
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.08} />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }}
                        axisLine={false}
                        tickLine={false}
                        width={36}
                      />
                      <Tooltip
                        formatter={(value: number, name) =>
                          name === "weight" ? [`${formatWeight(value)} kg`, "Ciężar"] : [value, name]
                        }
                        contentStyle={{
                          background: "var(--tooltip-bg, #1a1d23)",
                          border: "none",
                          borderRadius: 12,
                          fontSize: 12,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#ff6a3d"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: "#ff6a3d" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </>
        )}

        <div className="rounded-2xl border border-base-800/10 bg-base-800/[0.03] p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <h3 className="mb-1 font-display text-sm font-semibold">Kalkulator 1RM</h3>
          <p className="mb-3 text-xs text-base-800/50 dark:text-white/40">
            Szacowany ciężar maksymalny na jedno powtórzenie (wzór Epley).
          </p>
          <div className="mb-3 grid grid-cols-2 gap-3">
            <NumberField
              label="Ciężar (kg)"
              mode="decimal"
              value={rmWeight}
              onChange={setRmWeight}
            />
            <NumberField label="Powtórzenia" mode="numeric" value={rmReps} onChange={setRmReps} />
          </div>
          <div className="rounded-xl bg-accent/10 p-4 text-center">
            <p className="text-[11px] font-medium uppercase tracking-wide text-accent/80">
              Szacowane 1RM
            </p>
            <p className="tnum font-display text-3xl font-bold text-accent">
              {formatWeight(Math.round(oneRepMax * 10) / 10)} kg
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
