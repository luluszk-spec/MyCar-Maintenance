import { prisma } from "@/lib/prisma";
import { NewMaintenanceTypeForm } from "@/components/NewMaintenanceTypeForm";
import { DeleteButton } from "@/components/DeleteButton";

function intervalLabel(km: number | null, months: number | null) {
  const parts: string[] = [];
  if (km != null) parts.push(`${km.toLocaleString()}km`);
  if (months != null) parts.push(`${months}ヶ月`);
  return parts.length ? parts.join(" / ") : "目安なし";
}

export default async function MaintenanceTypesPage() {
  const types = await prisma.maintenanceType.findMany({
    orderBy: [{ isCustom: "asc" }, { createdAt: "asc" }],
  });
  const defaults = types.filter((t) => !t.isCustom);
  const custom = types.filter((t) => t.isCustom);

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">整備項目マスタ</h1>

      <div className="space-y-3">
        <h2 className="font-medium text-sm text-neutral-500">既定の項目</h2>
        <ul className="divide-y divide-neutral-200 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
          {defaults.map((t) => (
            <li key={t.id} className="px-4 py-3 flex items-center justify-between">
              <span>{t.name}</span>
              <span className="text-sm text-neutral-500">
                {intervalLabel(t.defaultIntervalKm, t.defaultIntervalMonths)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {custom.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-medium text-sm text-neutral-500">追加した項目</h2>
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
            {custom.map((t) => (
              <li key={t.id} className="px-4 py-3 flex items-center justify-between gap-2">
                <div>
                  <p>{t.name}</p>
                  <p className="text-sm text-neutral-500">
                    {intervalLabel(t.defaultIntervalKm, t.defaultIntervalMonths)}
                  </p>
                </div>
                <DeleteButton
                  url={`/api/maintenance-types/${t.id}`}
                  confirmMessage={`${t.name} を削除しますか？`}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="font-medium text-sm text-neutral-500">項目を追加</h2>
        <NewMaintenanceTypeForm />
      </div>
    </div>
  );
}
