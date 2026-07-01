"use client";

import { useRef, useState } from "react";
import { Sun, Moon, Download, Upload, X, Plus, AlertTriangle } from "lucide-react";
import { db, ensureSettings } from "@/lib/db";
import TopBar from "@/components/TopBar";
import Toggle from "@/components/Toggle";
import { useTheme } from "@/lib/ThemeProvider";
import { useSettings } from "@/lib/useSettings";
import { useToast } from "@/lib/ToastProvider";
import { exportBackup, importBackup } from "@/lib/exportImport";
import NumberField from "@/components/NumberField";

export default function UstawieniaClient() {
  const { theme, toggleTheme } = useTheme();
  const settings = useSettings();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newGroup, setNewGroup] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  const updateSettings = async (patch: Partial<typeof settings>) => {
    const current = await ensureSettings();
    await db.settings.put({ ...current, ...patch });
  };

  const addGroup = async () => {
    const trimmed = newGroup.trim();
    if (!trimmed || settings.muscleGroups.includes(trimmed)) return;
    await updateSettings({ muscleGroups: [...settings.muscleGroups, trimmed] });
    setNewGroup("");
  };

  const removeGroup = async (g: string) => {
    await updateSettings({ muscleGroups: settings.muscleGroups.filter((x) => x !== g) });
  };

  const handleExport = async () => {
    await exportBackup();
    showToast("Wyeksportowano kopię zapasową ✓");
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const result = await importBackup(file);
      showToast(`Zaimportowano ${result.sessions} treningów ✓`);
    } catch {
      showToast("Nie udało się zaimportować pliku", "error");
    }
  };

  const handleResetAll = async () => {
    await db.sessions.clear();
    await db.planDays.clear();
    setConfirmReset(false);
    showToast("Wyczyszczono wszystkie dane");
  };

  return (
    <div>
      <TopBar title="Ustawienia" />

      <div className="flex flex-col gap-6 px-4 pt-4 pb-10">
        {/* Theme */}
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-base-800/40 dark:text-white/35">
            Wygląd
          </h2>
          <div className="flex items-center justify-between rounded-2xl border border-base-800/10 bg-base-800/[0.03] p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex items-center gap-3">
              {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
              <span className="text-sm font-medium">
                {theme === "dark" ? "Ciemny motyw" : "Jasny motyw"}
              </span>
            </div>
            <Toggle checked={theme === "dark"} onChange={toggleTheme} label="Przełącz motyw" />
          </div>
        </section>

        {/* Rest timer */}
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-base-800/40 dark:text-white/35">
            Timer odpoczynku
          </h2>
          <div className="flex flex-col gap-4 rounded-2xl border border-base-800/10 bg-base-800/[0.03] p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex items-center gap-3">
              <div className="w-28">
                <NumberField
                  label="Domyślny czas (s)"
                  mode="numeric"
                  value={settings.restTimerDefault}
                  onChange={(v) => updateSettings({ restTimerDefault: v || 60 })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Dźwięk</span>
              <Toggle
                checked={settings.soundEnabled}
                onChange={(v) => updateSettings({ soundEnabled: v })}
                label="Dźwięk timera"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Wibracje</span>
              <Toggle
                checked={settings.vibrationEnabled}
                onChange={(v) => updateSettings({ vibrationEnabled: v })}
                label="Wibracje timera"
              />
            </div>
          </div>
        </section>

        {/* Muscle groups */}
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-base-800/40 dark:text-white/35">
            Partie mięśniowe
          </h2>
          <div className="rounded-2xl border border-base-800/10 bg-base-800/[0.03] p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="mb-3 flex flex-wrap gap-2">
              {settings.muscleGroups.map((g) => (
                <span
                  key={g}
                  className="flex items-center gap-1.5 rounded-full bg-base-800/8 px-3 py-1.5 text-xs font-medium dark:bg-white/8"
                >
                  {g}
                  <button
                    onClick={() => removeGroup(g)}
                    aria-label={`Usuń partię ${g}`}
                    className="text-base-800/40 dark:text-white/35"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                value={newGroup}
                onChange={(e) => setNewGroup(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addGroup()}
                placeholder="Nowa partia mięśniowa"
                className="h-10 flex-1 rounded-lg border border-base-800/10 bg-transparent px-3 text-sm outline-none focus:border-accent dark:border-white/10"
              />
              <button
                onClick={addGroup}
                aria-label="Dodaj partię"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-white"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* Backup */}
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-base-800/40 dark:text-white/35">
            Kopia zapasowa
          </h2>
          <p className="mb-3 text-xs text-base-800/50 dark:text-white/40">
            Dane siedzą wyłącznie na tym telefonie. Rób regularnie kopię zapasową — jeśli
            wyczyścisz dane przeglądarki albo zmienisz telefon, stracisz historię treningów.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleExport}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-white active:scale-[0.98]"
            >
              <Download size={17} />
              Eksportuj kopię zapasową
            </button>
            <button
              onClick={handleImportClick}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-accent/40 text-sm font-medium text-accent active:bg-accent/10"
            >
              <Upload size={17} />
              Importuj z pliku
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </section>

        {/* Danger zone */}
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-500/70">
            Strefa zagrożenia
          </h2>
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="text-sm font-medium text-red-500"
              >
                Wyczyść wszystkie dane z tego urządzenia
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="flex items-start gap-2 text-xs text-red-500">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                  To usunie wszystkie treningi i plan bezpowrotnie. Rozważ najpierw eksport kopii
                  zapasowej. Na pewno kontynuować?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleResetAll}
                    className="h-10 flex-1 rounded-lg bg-red-500 text-sm font-semibold text-white"
                  >
                    Usuń wszystko
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="h-10 flex-1 rounded-lg bg-base-800/10 text-sm font-medium dark:bg-white/10"
                  >
                    Anuluj
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <p className="text-center text-[11px] text-base-800/30 dark:text-white/25">
          Dziennik Treningowy · dane przechowywane lokalnie na urządzeniu
        </p>
      </div>
    </div>
  );
}
