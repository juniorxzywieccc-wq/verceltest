"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Returns a debounced version of `callback` plus a `flush` function that
 * runs any pending call immediately (used e.g. on unmount / route change
 * so we never lose the last edit).
 */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delayMs: number
): { run: (...args: Args) => void; flush: () => void } {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingArgsRef = useRef<Args | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (pendingArgsRef.current) {
      callbackRef.current(...pendingArgsRef.current);
      pendingArgsRef.current = null;
    }
  }, []);

  const run = useCallback(
    (...args: Args) => {
      pendingArgsRef.current = args;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        flush();
      }, delayMs);
    },
    [delayMs, flush]
  );

  useEffect(() => {
    return () => {
      flush();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { run, flush };
}
