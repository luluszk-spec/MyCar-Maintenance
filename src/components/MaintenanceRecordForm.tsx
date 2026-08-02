"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MaintenanceType } from "@prisma/client";

const inputClass =
  "w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-neutral-400";
const labelClass = "text-sm font-medium";

const FREE_TEXT_VALUE = "__free_text__";

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function MaintenanceRecordForm({
  vehicleId,
  currentOdometer,
  maintenanceTypes,
}: {
  vehicleId: string;
  currentOdometer: number;
  maintenanceTypes: MaintenanceType[];
}) {
  const router = useRouter();
  const [maintenanceTypeId, setMaintenanceTypeId] = useState(
    maintenanceTypes[0]?.id ?? FREE_TEXT_VALUE
  );
  const [customTitle, setCustomTitle] = useState("");
  const [date, setDate] = useState(todayInputValue());
  const [odometer, setOdometer] = useState(String(currentOdometer));
  const [cost, setCost] = useState("");
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFreeText = maintenanceTypeId === FREE_TEXT_VALUE;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isFreeText && !customTitle.trim()) {
      setError("整備項目を入力してください");
      return;
    }

    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/maintenance-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicleId,
        maintenanceTypeId: isFreeText ? null : maintenanceTypeId,
        customTitle: isFreeText ? customTitle : undefined,
        date: new Date(date).toISOString(),
        odometer: Number(odometer),
        cost: cost ? Number(cost) : undefined,
        memo: memo || undefined,
      }),
    });

    if (!res.ok) {
      setSubmitting(false);
      setError("登録に失敗しました");
      return;
    }

    router.push(`/vehicles/${vehicleId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="maintenanceType">
          整備項目
        </label>
        <select
          id="maintenanceType"
          className={inputClass}
          value={maintenanceTypeId}
          onChange={(e) => setMaintenanceTypeId(e.target.value)}
        >
          {maintenanceTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
          <option value={FREE_TEXT_VALUE}>自由入力...</option>
        </select>
      </div>

      {isFreeText && (
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="customTitle">
            項目名
          </label>
          <input
            id="customTitle"
            className={inputClass}
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="例: エアコンフィルター交換"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="date">
            日付
          </label>
          <input
            id="date"
            type="date"
            className={inputClass}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="odometer">
            走行距離 (km)
          </label>
          <input
            id="odometer"
            type="number"
            min={0}
            className={inputClass}
            value={odometer}
            onChange={(e) => setOdometer(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="cost">
          費用 (円・任意)
        </label>
        <input
          id="cost"
          type="number"
          min={0}
          className={inputClass}
          value={cost}
          onChange={(e) => setCost(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="memo">
          メモ (任意)
        </label>
        <textarea
          id="memo"
          className={inputClass}
          rows={3}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 py-2 font-medium disabled:opacity-50"
      >
        {submitting ? "登録中..." : "記録する"}
      </button>
    </form>
  );
}
