import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NewMaintenanceTypeForm } from "@/components/NewMaintenanceTypeForm";
import { MaintenanceTypeRow } from "@/components/MaintenanceTypeRow";
import { getCurrentUserId } from "@/lib/session";

export default async function MaintenanceTypesPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const types = await prisma.maintenanceType.findMany({
    where: { userId },
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
            <MaintenanceTypeRow key={t.id} type={t} />
          ))}
        </ul>
      </div>

      {custom.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-medium text-sm text-neutral-500">追加した項目</h2>
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
            {custom.map((t) => (
              <MaintenanceTypeRow key={t.id} type={t} />
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
