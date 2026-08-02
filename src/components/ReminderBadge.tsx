import type { MaintenanceStatus } from "@/lib/maintenance";
import { formatRemaining } from "@/lib/maintenance";

function urgencyLevel(status: MaintenanceStatus): "overdue" | "soon" | "ok" {
  if (status.isOverdue) return "overdue";
  const soonByDays = status.remainingDays != null && status.remainingDays <= 30;
  const soonByKm = status.remainingKm != null && status.remainingKm <= 1000;
  if (soonByDays || soonByKm) return "soon";
  return "ok";
}

const STYLES: Record<string, string> = {
  overdue:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900",
  soon: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900",
  ok: "bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800",
};

export function ReminderBadge({ status }: { status: MaintenanceStatus }) {
  const level = urgencyLevel(status);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${STYLES[level]}`}
    >
      {status.typeName}: {formatRemaining(status)}
    </span>
  );
}
