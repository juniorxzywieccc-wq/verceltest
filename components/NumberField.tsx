"use client";

interface NumberFieldProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  step?: number;
  mode?: "decimal" | "numeric";
  className?: string;
}

export default function NumberField({
  value,
  onChange,
  label,
  step = 1,
  mode = "numeric",
  className = "",
}: NumberFieldProps) {
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
        value={value === 0 ? "" : String(value).replace(".", ",")}
        placeholder="0"
        step={step}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => {
          const raw = e.target.value.replace(",", ".");
          if (raw === "") {
            onChange(0);
            return;
          }
          const num = Number(raw);
          if (!Number.isNaN(num)) onChange(num);
        }}
        className={`tnum font-display h-12 w-full rounded-xl border border-base-800/10 bg-base-800/5 text-center text-lg font-semibold outline-none focus:border-accent focus:bg-transparent dark:border-white/10 dark:bg-white/5 ${className}`}
      />
    </label>
  );
}
