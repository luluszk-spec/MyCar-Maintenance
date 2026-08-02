"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-neutral-400";
const labelClass = "text-sm font-medium";

export default function NewVehiclePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<"CAR" | "MOTORCYCLE">("CAR");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [currentOdometer, setCurrentOdometer] = useState("0");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        type,
        make: make || undefined,
        model: model || undefined,
        year: year ? Number(year) : undefined,
        currentOdometer: currentOdometer ? Number(currentOdometer) : 0,
      }),
    });

    if (!res.ok) {
      setSubmitting(false);
      setError("登録に失敗しました");
      return;
    }

    const vehicle = await res.json();
    router.push(`/vehicles/${vehicle.id}`);
    router.refresh();
  }

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-xl font-semibold">車両を追加</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className={labelClass}>種別</label>
          <div className="flex gap-2">
            {(["CAR", "MOTORCYCLE"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium ${
                  type === t
                    ? "border-neutral-900 dark:border-white bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "border-neutral-300 dark:border-neutral-700"
                }`}
              >
                {t === "CAR" ? "🚗 車" : "🏍️ バイク"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="name">
            名前
          </label>
          <input
            id="name"
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 愛車のプリウス"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="make">
              メーカー
            </label>
            <input
              id="make"
              className={inputClass}
              value={make}
              onChange={(e) => setMake(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="model">
              車種名
            </label>
            <input
              id="model"
              className={inputClass}
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="year">
              年式
            </label>
            <input
              id="year"
              type="number"
              className={inputClass}
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="odometer">
              現在の走行距離 (km)
            </label>
            <input
              id="odometer"
              type="number"
              min={0}
              className={inputClass}
              value={currentOdometer}
              onChange={(e) => setCurrentOdometer(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 py-2 font-medium disabled:opacity-50"
        >
          {submitting ? "登録中..." : "登録する"}
        </button>
      </form>
    </div>
  );
}
