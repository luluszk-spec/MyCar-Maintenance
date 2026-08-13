"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV_ITEMS = [
  { href: "/", label: "ダッシュボード", icon: "🏠" },
  { href: "/vehicles", label: "車両", icon: "🚗" },
  { href: "/maintenance-types", label: "整備項目", icon: "🔧" },
  { href: "/costs", label: "コスト", icon: "💰" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks({ userLabelSlot }: { userLabelSlot?: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-1 text-sm">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`px-3 py-2 rounded-md whitespace-nowrap ${
            isActive(pathname, item.href)
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          {item.label}
        </Link>
      ))}
      {userLabelSlot}
      <form action="/api/auth/logout" method="POST">
        <button
          type="submit"
          className="px-3 py-2 rounded-md text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 whitespace-nowrap"
        >
          ログアウト
        </button>
      </form>
    </nav>
  );
}
