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
  // `html` already has class="dark" set server-side in layout.tsx, so we can
  // paint the whole app immediately with that assumption instead of blocking
  // on an IndexedDB read first. If the saved theme turns out to be "light",
  // we just flip the class right after — much less noticeable than a blank
  // screen on every single app open.
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const settings = await ensureSettings();
      if (mounted) setThemeState(settings.theme);
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
