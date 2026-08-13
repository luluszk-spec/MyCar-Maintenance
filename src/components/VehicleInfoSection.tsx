"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TYPE_LABEL: Record<string, string> = { CAR: "車", MOTORCYCLE: "バイク" };

const inputClass =
  "w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400";
const labelClass = "text-xs font-medium text-neutral-500";

type Vehicle = {
  id: string;
  type: string;
  make: string | null;
  model: string | null;
  year: number | null;
  grade: string | null;
  plateNumber: string | null;
  purchaseDate: string | null;
};

export function VehicleInfoSection({ vehicle }: { vehicle: Vehicle }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [make, setMake] = useState(vehicle.make ?? "");
  const [model, setModel] = useState(vehicle.model ?? "");
  const [year, setYear] = useState(vehicle.year != null ? String(vehicle.year) : "");
  const [grade, setGrade] = useState(vehicle.grade ?? "");
  const [plateNumber, setPlateNumber] = useState(vehicle.plateNumber ?? "");
  const [purchaseDate, setPurchaseDate] = useState(vehicle.purchaseDate?.slice(0, 10) ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summary = [
    TYPE_LABEL[vehicle.type] ?? vehicle.type,
    vehicle.make ? `・ ${vehicle.make}` : "",
    vehicle.model ?? "",
    vehicle.year ? `(${vehicle.year})` : "",
  ]
    .filter(Boolean)
    .join(" ");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/vehicles/${vehicle.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        make: make || null,
        model: model || null,
        year: year ? Number(year) : null,
        grade: grade || null,
        plateNumber: plateNumber || null,
        purchaseDate: purchaseDate || null,
      }),
    });

    setSubmitting(false);
    if (!res.ok) {
      setError("保存に失敗しました");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:underline"
      >
        <span>{summary || "車両情報"}</span>
        <span>{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <form
          onSubmit={handleSubmit}
          className="mt-2 space-y-3 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="vehicle-make">
                メーカー
              </label>
              <input
                id="vehicle-make"
                className={inputClass}
                value={make}
                onChange={(e) => setMake(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="vehicle-model">
                車種名
              </label>
              <input
                id="vehicle-model"
                className={inputClass}
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="vehicle-year">
                年式
              </label>
              <input
                id="vehicle-year"
                type="number"
                className={inputClass}
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="vehicle-grade">
                グレード
              </label>
              <input
                id="vehicle-grade"
                className={inputClass}
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="vehicle-plate">
                ナンバー
              </label>
              <input
                id="vehicle-plate"
                className={inputClass}
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass} htmlFor="vehicle-purchase-date">
                購入日
              </label>
              <input
                id="vehicle-purchase-date"
                type="date"
                className={inputClass}
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-50"
          >
            {submitting ? "保存中..." : "保存"}
          </button>
        </form>
      )}
    </div>
  );
}
