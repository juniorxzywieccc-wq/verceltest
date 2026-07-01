import Link from "next/link";
import { Settings } from "lucide-react";

export default function TopBar({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-base-800/10 bg-base-50/90 px-4 pb-3 pt-safe-t backdrop-blur-md dark:border-white/5 dark:bg-base-950/90">
      <div className="flex items-center justify-between pt-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-base-800/60 dark:text-white/50">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {right}
          <Link
            href="/ustawienia"
            aria-label="Ustawienia"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-base-800/5 text-base-800/70 active:scale-95 dark:bg-white/5 dark:text-white/70"
          >
            <Settings size={19} />
          </Link>
        </div>
      </div>
    </header>
  );
}
