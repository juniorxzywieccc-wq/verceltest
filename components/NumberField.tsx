"use client";

import { useEffect, useRef, useState } from "react";

interface NumberFieldProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  step?: number;
  mode?: "decimal" | "numeric";
  className?: string;
}

// Turns a numeric value into the text we show in the input, Polish-style
// (comma as decimal separator).
function toDisplay(value: number): string {
  return value === 0 ? "" : String(value).replace(".", ",");
}

export default function NumberField({
  value,
  onChange,
  label,
  step = 1,
  mode = "numeric",
  className = "",
}: NumberFieldProps) {
  // We keep the *text* the user is typing in local state instead of always
  // deriving it from `value`. Previously the input re-rendered from the
  // numeric value on every keystroke, so typing a trailing separator like
  // "82," got immediately collapsed back to "82" (since Number("82,") === 82
  // strips the comma). The very next digit then landed after "82" instead of
  // after "82,", turning "82,5" into "825". Keeping local text state lets the
  // user finish typing a decimal before we round-trip through a number.
  const [text, setText] = useState(() => toDisplay(value));
  const isEditing = useRef(false);

  // If the value changes from outside (e.g. loading a different day/set,
  // or "seria" duplicating the last weight) and the user isn't mid-typing,
  // sync the displayed text to match.
  useEffect(() => {
    if (!isEditing.current) {
      setText(toDisplay(value));
    }
  }, [value]);

  return (
    <label className="flex flex-col items-center gap-1">
      {label && (
        <span className="text-[10px] font-medium uppercase tracking-wide text-base-800/40 dark:text-white/35">
          {label}
        </span>
      )}
      <input
        type="text"
        inputMode={mode}
        pattern={mode === "decimal" ? "[0-9]*[.,]?[0-9]*" : "[0-9]*"}
        value={text}
        placeholder="0"
        step={step}
        onFocus={(e) => {
          isEditing.current = true;
          e.currentTarget.select();
        }}
        onBlur={() => {
          isEditing.current = false;
          // Normalize the displayed text once the user is done editing.
          setText(toDisplay(value));
        }}
        onChange={(e) => {
          isEditing.current = true;
          let raw = e.target.value;

          // Only allow digits and a single separator (comma or dot).
          if (mode === "decimal") {
            raw = raw.replace(/[^0-9.,]/g, "");
            const firstSep = raw.search(/[.,]/);
            if (firstSep !== -1) {
              raw =
                raw.slice(0, firstSep + 1) +
                raw.slice(firstSep + 1).replace(/[.,]/g, "");
            }
          } else {
            raw = raw.replace(/[^0-9]/g, "");
          }

          setText(raw);

          if (raw === "" || raw === "," || raw === ".") {
            onChange(0);
            return;
          }
          const num = Number(raw.replace(",", "."));
          if (!Number.isNaN(num)) onChange(num);
        }}
        className={`tnum font-display h-12 w-full rounded-xl border border-base-800/10 bg-base-800/5 text-center text-lg font-semibold outline-none focus:border-accent focus:bg-transparent dark:border-white/10 dark:bg-white/5 ${className}`}
      />
    </label>
  );
}
