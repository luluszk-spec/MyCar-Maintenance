"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function OdometerUpdateForm({
  vehicleId,
  currentOdometer,
}: {
  vehicleId: string;
  currentOdometer: number;
}) {
  const router = useRouter();
  const [value, setValue] = useState(String(currentOdometer));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayValue = value === "" ? "" : Number(value).toLocaleString("ja-JP");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value.replace(/[^0-9]/g, ""));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/vehicles/${vehicleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentOdometer: Number(value) }),
    });

    setSubmitting(false);
    if (!res.ok) {
      setError("更新に失敗しました");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="odometer-update">
          走行距離を更新 (km)
        </label>
        <input
          id="odometer-update"
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          className="w-[calc(9ch+1.75rem)] rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-neutral-400"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-50"
      >
        更新
      </button>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}
