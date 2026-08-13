"use client";

import { useState } from "react";
import type { MaintenanceStatus } from "@/lib/maintenance";

export function CheckReminderButton({ status }: { status: MaintenanceStatus }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full space-y-2">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300"
      >
        🔍 {status.typeName}を確認 {expanded ? "▲" : "▼"}
      </button>

      {expanded && (
        <ul className="divide-y divide-neutral-200 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
          {status.history.length === 0 ? (
            <li className="px-4 py-3 text-sm text-neutral-400">まだ記録がありません</li>
          ) : (
            status.history.map((entry) => (
              <li key={entry.id} className="px-4 py-3 space-y-1">
                <p className="text-sm text-neutral-500">
                  {entry.date.toLocaleDateString("ja-JP")} ・{" "}
                  {entry.odometer.toLocaleString()} km
                  {entry.cost != null ? ` ・ ¥${entry.cost.toLocaleString()}` : ""}
                </p>
                {entry.memo && <p className="text-sm text-neutral-500">{entry.memo}</p>}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
