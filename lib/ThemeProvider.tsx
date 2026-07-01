"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { db, ensureSettings } from "./db";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const settings = await ensureSettings();
        if (mounted) setThemeState(settings.theme);
      } finally {
        if (mounted) setReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    root.style.colorScheme = theme;
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    if (db) {
      ensureSettings().then((s) => db.settings.put({ ...s, theme: t }));
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      if (db) {
        ensureSettings().then((s) => db.settings.put({ ...s, theme: next }));
      }
      return next;
    });
  }, []);

  if (!ready) {
    // Avoid a flash of wrong theme before settings load.
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
