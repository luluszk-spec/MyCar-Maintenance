"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-neutral-400";
const labelClass = "text-sm font-medium";

export function NewMaintenanceTypeForm({
  vehicleType,
}: {
  vehicleType: "CAR" | "MOTORCYCLE";
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isCheckOnly, setIsCheckOnly] = useState(false);
  const [intervalKm, setIntervalKm] = useState("");
  const [intervalMonths, setIntervalMonths] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/maintenance-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        vehicleType,
        isCheckOnly,
        defaultIntervalKm: !isCheckOnly && intervalKm ? Number(intervalKm) : undefined,
        defaultIntervalMonths: intervalMonths ? Number(intervalMonths) : undefined,
      }),
    });

    setSubmitting(false);
    if (!res.ok) {
      setError("追加に失敗しました");
      return;
    }

    setName("");
    setIsCheckOnly(false);
    setIntervalKm("");
    setIntervalMonths("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="type-name">
          項目名
        </label>
        <input
          id="type-name"
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: エアコンフィルター交換"
          required
        />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>管理方法</label>
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
          <label className={labelClass} htmlFor="type-months">
            確認間隔 (ヶ月)
          </label>
          <input
            id="type-months"
            type="number"
            min={0}
            className={inputClass}
            value={intervalMonths}
            onChange={(e) => setIntervalMonths(e.target.value)}
            required
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="type-km">
              距離の目安 (km・任意)
            </label>
            <input
              id="type-km"
              type="number"
              min={0}
              className={inputClass}
              value={intervalKm}
              onChange={(e) => setIntervalKm(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="type-months">
              期間の目安 (ヶ月・任意)
            </label>
            <input
              id="type-months"
              type="number"
              min={0}
              className={inputClass}
              value={intervalMonths}
              onChange={(e) => setIntervalMonths(e.target.value)}
            />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {submitting ? "追加中..." : "追加する"}
      </button>
    </form>
  );
}
