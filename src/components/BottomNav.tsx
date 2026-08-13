"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/components/NavLinks";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-20 border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 6px)" }}
    >
      <div className="flex">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 pt-2 pb-1 min-h-[49px] text-[11px] active:opacity-60 ${
                active
                  ? "text-neutral-900 dark:text-white font-medium"
                  : "text-neutral-400 dark:text-neutral-500"
              }`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
