"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteButton({
  url,
  confirmMessage,
  redirectTo,
  label = "削除",
  className = "text-sm text-red-600 dark:text-red-400 hover:underline",
}: {
  url: string;
  confirmMessage: string;
  redirectTo?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (!window.confirm(confirmMessage)) return;
    setBusy(true);
    const res = await fetch(url, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      const body: { error?: string } | null = await res.json().catch(() => null);
      window.alert(body?.error ?? "削除に失敗しました");
      return;
    }
    if (redirectTo) {
      router.push(redirectTo);
    }
    router.refresh();
  }

  return (
    <button type="button" onClick={handleClick} disabled={busy} className={className}>
      {busy ? "..." : label}
    </button>
  );
}
