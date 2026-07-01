"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db, DEFAULT_SETTINGS, ensureSettings } from "./db";
import type { AppSettings } from "./types";
import { useEffect } from "react";

export function useSettings(): AppSettings {
  useEffect(() => {
    ensureSettings();
  }, []);

  const settings = useLiveQuery(() => db.settings.get("app"), []);
  return settings ?? DEFAULT_SETTINGS;
}
