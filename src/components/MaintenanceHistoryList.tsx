"use client";

import { useState } from "react";
import type { Prisma } from "@prisma/client";
import { DeleteButton } from "@/components/DeleteButton";

type RecordWithType = Prisma.MaintenanceRecordGetPayload<{
  include: { maintenanceType: true };
}>;

function RecordRow({ record }: { record: RecordWithType }) {
  return (
    <li className="px-4 py-3 space-y-1">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium">{record.maintenanceType?.name ?? record.customTitle}</p>
        <DeleteButton
          url={`/api/maintenance-records/${record.id}`}
          confirmMessage="この整備記録を削除しますか？"
        />
      </div>
      <p className="text-sm text-neutral-500">
        {record.date.toLocaleDateString("ja-JP")} ・ {record.odometer.toLocaleString()} km
        {record.cost != null ? ` ・ ¥${record.cost.toLocaleString()}` : ""}
      </p>
      {record.memo && <p className="text-sm text-neutral-500">{record.memo}</p>}
    </li>
  );
}

function HistoryGroup({ records }: { records: RecordWithType[] }) {
  const [expanded, setExpanded] = useState(false);
  const [latest, ...past] = records;

  return (
    <>
      <RecordRow record={latest} />
      {past.length > 0 && (
        <li className="bg-neutral-50 dark:bg-neutral-900">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="w-full text-left px-4 py-2 text-sm text-neutral-500 hover:underline"
          >
            過去の記録 {past.length}件 {expanded ? "▲" : "▼"}
          </button>
          {expanded && (
            <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {past.map((record) => (
                <RecordRow key={record.id} record={record} />
              ))}
            </ul>
          )}
        </li>
      )}
    </>
  );
}

export function MaintenanceHistoryList({ records }: { records: RecordWithType[] }) {
  if (records.length === 0) {
    return <p className="text-sm text-neutral-400">まだ記録がありません</p>;
  }

  const groups = new Map<string, RecordWithType[]>();
  for (const record of records) {
    const key = record.maintenanceTypeId ?? `custom:${record.customTitle}`;
    const group = groups.get(key);
    if (group) group.push(record);
    else groups.set(key, [record]);
  }

  return (
    <ul className="divide-y divide-neutral-200 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
      {[...groups.values()].map((group) => (
        <HistoryGroup key={group[0].id} records={group} />
      ))}
    </ul>
  );
}
