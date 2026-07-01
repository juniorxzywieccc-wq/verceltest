import type { SetEntry } from "./types";

export function formatWeight(weight: number): string {
  const rounded = Math.round(weight * 100) / 100;
  return rounded.toString().replace(".", ",");
}

export function formatSetsSummary(sets: SetEntry[]): string {
  if (sets.length === 0) return "brak serii";

  const allSameReps = sets.every((s) => s.reps === sets[0].reps);
  const allSameWeight = sets.every((s) => s.weight === sets[0].weight);

  if (allSameReps && allSameWeight) {
    return `${sets.length}×${sets[0].reps} @ ${formatWeight(sets[0].weight)}kg`;
  }

  return sets.map((s) => `${s.reps}@${formatWeight(s.weight)}`).join(", ") + "kg";
}

export function formatDatePL(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDateShortPL(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit" });
}

export function formatWeekdayPL(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  const label = d.toLocaleDateString("pl-PL", { weekday: "long" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}
