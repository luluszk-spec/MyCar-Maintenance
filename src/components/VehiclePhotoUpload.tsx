"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.8;

async function resizeAndCompress(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas not supported");
  ctx.drawImage(bitmap, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

export function VehiclePhotoUpload({
  vehicleId,
  photoUrl,
}: {
  vehicleId: string;
  photoUrl: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(photoUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(nextPhotoUrl: string | null) {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/vehicles/${vehicleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoUrl: nextPhotoUrl }),
    });
    setBusy(false);
    if (!res.ok) {
      const body: { error?: string } | null = await res.json().catch(() => null);
      setError(body?.error ?? "写真の保存に失敗しました");
      return;
    }
    setPreview(nextPhotoUrl);
    router.refresh();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const dataUrl = await resizeAndCompress(file);
      await save(dataUrl);
    } catch {
      setError("この画像を読み込めませんでした。別の写真でお試しください");
      setBusy(false);
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element -- user-uploaded data URL, not a static asset
        <img
          src={preview}
          alt=""
          className="w-full aspect-[16/9] object-cover rounded-lg border border-neutral-200 dark:border-neutral-800"
        />
      ) : (
        <div className="w-full aspect-[16/9] rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center text-neutral-400 text-sm">
          写真未設定
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id={`vehicle-photo-${vehicleId}`}
      />
      <div className="flex items-center gap-3">
        <label
          htmlFor={`vehicle-photo-${vehicleId}`}
          className="cursor-pointer text-sm rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-900"
        >
          {busy ? "処理中..." : preview ? "写真を変更" : "写真を追加"}
        </label>
        {preview && !busy && (
          <button
            type="button"
            onClick={() => save(null)}
            className="text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            削除
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
