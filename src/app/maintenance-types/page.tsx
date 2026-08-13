import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NewMaintenanceTypeForm } from "@/components/NewMaintenanceTypeForm";
import { MaintenanceTypeRow } from "@/components/MaintenanceTypeRow";
import { getCurrentUserId } from "@/lib/session";
import type { MaintenanceType } from "@prisma/client";

function VehicleTypeSection({
  title,
  icon,
  vehicleType,
  types,
}: {
  title: string;
  icon: string;
  vehicleType: "CAR" | "MOTORCYCLE";
  types: MaintenanceType[];
}) {
  const defaults = types.filter((t) => !t.isCustom);
  const custom = types.filter((t) => t.isCustom);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">
        {icon} {title}
      </h2>

      <div className="space-y-3">
        <h3 className="font-medium text-sm text-neutral-500">既定の項目</h3>
        <ul className="divide-y divide-neutral-200 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
          {defaults.map((t) => (
            <MaintenanceTypeRow key={t.id} type={t} />
          ))}
        </ul>
      </div>

      {custom.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-sm text-neutral-500">追加した項目</h3>
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
            {custom.map((t) => (
              <MaintenanceTypeRow key={t.id} type={t} />
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="font-medium text-sm text-neutral-500">項目を追加</h3>
        <NewMaintenanceTypeForm vehicleType={vehicleType} />
      </div>
    </div>
  );
}

export default async function MaintenanceTypesPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const types = await prisma.maintenanceType.findMany({
    where: { userId },
    orderBy: [{ isCustom: "asc" }, { createdAt: "asc" }],
  });
  const carTypes = types.filter((t) => t.vehicleType == null || t.vehicleType === "CAR");
  const motorcycleTypes = types.filter(
    (t) => t.vehicleType == null || t.vehicleType === "MOTORCYCLE"
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-semibold">整備項目マスタ</h1>
        <p className="text-sm text-neutral-500 mt-1">
          「共通」と表示されている項目は車・バイクどちらにも表示されます。編集して対象を選ぶと、その車両種別専用になります。
        </p>
      </div>

      <VehicleTypeSection title="車" icon="🚗" vehicleType="CAR" types={carTypes} />

      <div className="border-t border-neutral-200 dark:border-neutral-800" />

      <VehicleTypeSection
        title="バイク"
        icon="🏍️"
        vehicleType="MOTORCYCLE"
        types={motorcycleTypes}
      />
    </div>
  );
}
