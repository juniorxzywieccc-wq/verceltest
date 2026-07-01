"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Timer, X, Plus, Minus } from "lucide-react";
import { useSettings } from "@/lib/useSettings";

function playBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.55);
    osc.onended = () => ctx.close();
  } catch {
    // Audio not available — ignore, vibration still fires.
  }
}

export default function RestTimer() {
  const settings = useSettings();
  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState(90);
  const [remaining, setRemaining] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setDuration(settings.restTimerDefault);
  }, [settings.restTimerDefault]);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRemaining(null);
  }, []);

  const start = useCallback(
    (seconds: number) => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setRemaining(seconds);
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = null;
            if (settings.soundEnabled) playBeep();
            if (settings.vibrationEnabled && "vibrate" in navigator) {
              navigator.vibrate([200, 100, 200]);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [settings.soundEnabled, settings.vibrationEnabled]
  );

  useEffect(() => () => stop(), [stop]);

  const mm = remaining !== null ? Math.floor(remaining / 60) : 0;
  const ss = remaining !== null ? remaining % 60 : 0;
  const running = remaining !== null;

  return (
    <div className="fixed bottom-24 right-4 z-40">
      {open && (
        <div className="mb-3 w-56 rounded-2xl border border-base-800/10 bg-base-50 p-4 shadow-card dark:border-white/10 dark:bg-base-900">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-base-800/70 dark:text-white/60">
              Odpoczynek
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Zamknij timer"
              className="rounded-full p-1 text-base-800/50 dark:text-white/40"
            >
              <X size={16} />
            </button>
          </div>

          {running ? (
            <div className="flex flex-col items-center gap-3">
              <div className="font-display tnum text-4xl font-semibold tabular-nums">
                {String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
              </div>
              <button
                onClick={stop}
                className="w-full rounded-xl bg-base-800/10 py-2 text-sm font-medium dark:bg-white/10"
              >
                Zatrzymaj
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-center gap-3">
                <button
                  aria-label="Mniej czasu"
                  onClick={() => setDuration((d) => Math.max(10, d - 15))}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-base-800/10 dark:bg-white/10"
                >
                  <Minus size={16} />
                </button>
                <div className="font-display tnum w-16 text-center text-2xl font-semibold">
                  {duration}s
                </div>
                <button
                  aria-label="Więcej czasu"
                  onClick={() => setDuration((d) => Math.min(600, d + 15))}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-base-800/10 dark:bg-white/10"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[60, 90, 120].map((s) => (
                  <button
                    key={s}
                    onClick={() => setDuration(s)}
                    className={`rounded-lg py-1.5 text-xs font-medium ${
                      duration === s
                        ? "bg-accent text-white"
                        : "bg-base-800/10 text-base-800/70 dark:bg-white/10 dark:text-white/60"
                    }`}
                  >
                    {s}s
                  </button>
                ))}
              </div>
              <button
                onClick={() => start(duration)}
                className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white active:scale-[0.98]"
              >
                Start
              </button>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Timer odpoczynku"
        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-card active:scale-95 ${
          running ? "bg-accent text-white" : "bg-base-800 text-white dark:bg-white dark:text-base-950"
        }`}
      >
        {running ? (
          <span className="font-display tnum text-xs font-bold">
            {String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
          </span>
        ) : (
          <Timer size={22} />
        )}
      </button>
    </div>
  );
}
