"use client";

import { useState } from "react";
import type { MaintenanceStatus } from "@/lib/maintenance";
import { isUrgent } from "@/lib/maintenance";
import { ReminderBadge } from "@/components/ReminderBadge";
import { CheckReminderButton } from "@/components/CheckReminderButton";

export function ReminderList({ statuses }: { statuses: MaintenanceStatus[] }) {
  const [expanded, setExpanded] = useState(false);

  if (statuses.length === 0) return null;

  const urgent = statuses.filter(isUrgent);
  const other = statuses.filter((s) => !isUrgent(s));

  return (
    <div className="flex flex-wrap items-center gap-2">
      {urgent.map((status) =>
        status.isCheckOnly ? (
          <CheckReminderButton key={status.maintenanceTypeId} status={status} />
        ) : (
          <ReminderBadge key={status.maintenanceTypeId} status={status} />
        )
      )}
      {other.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 rounded-full border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900"
          >
            その他 {other.length}件 {expanded ? "▲" : "▼"}
          </button>
          {expanded &&
            other.map((status) => (
              <ReminderBadge key={status.maintenanceTypeId} status={status} />
            ))}
        </>
      )}
    </div>
  );
}
