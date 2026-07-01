"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface ToastItem {
  id: number;
  text: string;
  tone: "ok" | "error";
  leaving: boolean;
}

interface ToastContextValue {
  showToast: (text: string, tone?: "ok" | "error") => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const showToast = useCallback((text: string, tone: "ok" | "error" = "ok") => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, text, tone, leaving: false }]);

    window.setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    }, 1400);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 1700);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto left-1/2 rounded-full px-4 py-2 text-sm font-medium shadow-card ${
              t.leaving ? "animate-toast-out" : "animate-toast-in"
            } ${
              t.tone === "ok"
                ? "bg-ok/15 text-ok ring-1 ring-ok/30"
                : "bg-red-500/15 text-red-400 ring-1 ring-red-500/30"
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
