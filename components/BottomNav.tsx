"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, CalendarDays, History, LineChart } from "lucide-react";

const items = [
  { href: "/trening", label: "Trening", icon: Dumbbell },
  { href: "/plan", label: "Plan", icon: CalendarDays },
  { href: "/historia", label: "Historia", icon: History },
  { href: "/statystyki", label: "Statystyki", icon: LineChart },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md border-t border-base-800/10 bg-base-50/90 pb-safe-b backdrop-blur-md dark:border-white/5 dark:bg-base-950/90 sm:max-w-lg md:max-w-2xl"
      aria-label="Nawigacja główna"
    >
      {/* barbell rail: a thin bar with a plate on the active tab */}
      <div className="relative mx-4 h-[2px] bg-base-800/10 dark:bg-white/10">
        <div
          className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-accent transition-all duration-200"
          style={{
            left: `calc(${items.findIndex((i) => pathname?.startsWith(i.href))} * (100% / 4) + (100% / 8) - 3px)`,
          }}
        />
      </div>
      <ul className="grid grid-cols-4">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className="flex min-h-[56px] flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium tracking-tight"
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2.5 : 1.75}
                  className={active ? "text-accent" : "text-base-800/50 dark:text-white/40"}
                />
                <span
                  className={active ? "text-accent" : "text-base-800/50 dark:text-white/40"}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
