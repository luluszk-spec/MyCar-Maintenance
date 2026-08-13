"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MaintenanceType } from "@prisma/client";
import { DeleteButton } from "@/components/DeleteButton";

const inputClass =
  "w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-neutral-400";

function intervalLabel(km: number | null, months: number | null, isCheckOnly: boolean) {
  if (isCheckOnly) {
    return months != null ? `都度確認（${months}ヶ月ごと）` : "都度確認";
  }
  const parts: string[] = [];
  if (km != null) parts.push(`${km.toLocaleString()}km`);
  if (months != null) parts.push(`${months}ヶ月`);
  return parts.length ? parts.join(" / ") : "目安なし";
}

export function MaintenanceTypeRow({ type }: { type: MaintenanceType }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(type.name);
  const [vehicleType, setVehicleType] = useState<"CAR" | "MOTORCYCLE">(
    type.vehicleType === "MOTORCYCLE" ? "MOTORCYCLE" : "CAR"
  );
  const [isCheckOnly, setIsCheckOnly] = useState(type.isCheckOnly);
  const [km, setKm] = useState(type.defaultIntervalKm?.toString() ?? "");
  const [months, setMonths] = useState(type.defaultIntervalMonths?.toString() ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function cancel() {
    setName(type.name);
    setVehicleType(type.vehicleType === "MOTORCYCLE" ? "MOTORCYCLE" : "CAR");
    setIsCheckOnly(type.isCheckOnly);
    setKm(type.defaultIntervalKm?.toString() ?? "");
    setMonths(type.defaultIntervalMonths?.toString() ?? "");
    setError(null);
    setEditing(false);
  }

  async function save() {
    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/maintenance-types/${type.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        vehicleType,
        isCheckOnly,
        defaultIntervalKm: !isCheckOnly && km ? Number(km) : null,
        defaultIntervalMonths: months ? Number(months) : null,
      }),
    });

    setSubmitting(false);
    if (!res.ok) {
      const body: { error?: string } | null = await res.json().catch(() => null);
      setError(body?.error ?? "更新に失敗しました");
      return;
    }

    setEditing(false);
    router.refresh();
  }

  if (editing) {
    return (
      <li className="px-4 py-3 space-y-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">項目名</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">対象</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setVehicleType("CAR")}
              className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${
                vehicleType === "CAR"
                  ? "border-neutral-900 dark:border-white bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "border-neutral-300 dark:border-neutral-700"
              }`}
            >
              🚗 車
            </button>
            <button
              type="button"
              onClick={() => setVehicleType("MOTORCYCLE")}
              className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${
                vehicleType === "MOTORCYCLE"
                  ? "border-neutral-900 dark:border-white bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "border-neutral-300 dark:border-neutral-700"
              }`}
            >
              🏍️ バイク
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">管理方法</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsCheckOnly(false)}
              className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${
                !isCheckOnly
                  ? "border-neutral-900 dark:border-white bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "border-neutral-300 dark:border-neutral-700"
              }`}
            >
              距離・期間で管理
            </button>
            <button
              type="button"
              onClick={() => setIsCheckOnly(true)}
              className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${
                isCheckOnly
                  ? "border-neutral-900 dark:border-white bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "border-neutral-300 dark:border-neutral-700"
              }`}
            >
              都度確認
            </button>
          </div>
        </div>

        {isCheckOnly ? (
          <div className="space-y-1.5">
            <label className="text-sm font-medium">確認間隔 (ヶ月)</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={months}
              onChange={(e) => setMonths(e.target.value)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">距離の目安 (km・任意)</label>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={km}
                onChange={(e) => setKm(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">期間の目安 (ヶ月・任意)</label>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={months}
                onChange={(e) => setMonths(e.target.value)}
              />
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={save}
            disabled={submitting}
            className="rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-3 py-1.5 text-sm font-medium disabled:opacity-50"
          >
            {submitting ? "保存中..." : "保存"}
          </button>
          <button
            type="button"
            onClick={cancel}
            disabled={submitting}
            className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm"
          >
            キャンセル
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="px-4 py-3 flex items-center justify-between gap-2">
      <div>
        <p>
          {type.name}
          {type.vehicleType == null && (
            <span className="ml-2 text-xs text-neutral-400 border border-neutral-300 dark:border-neutral-700 rounded px-1.5 py-0.5">
              共通
            </span>
          )}
        </p>
        <p className="text-sm text-neutral-500">
          {intervalLabel(type.defaultIntervalKm, type.defaultIntervalMonths, type.isCheckOnly)}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-sm text-neutral-500 hover:underline"
        >
          編集
        </button>
        {type.isCustom && (
          <DeleteButton
            url={`/api/maintenance-types/${type.id}`}
            confirmMessage={`${type.name} を削除しますか？`}
          />
        )}
      </div>
    </li>
  );
}
