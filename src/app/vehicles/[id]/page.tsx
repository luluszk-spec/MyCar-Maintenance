import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { computeMaintenanceStatuses } from "@/lib/maintenance";
import { ReminderList } from "@/components/ReminderList";
import { OdometerUpdateForm } from "@/components/OdometerUpdateForm";
import { DeleteButton } from "@/components/DeleteButton";
import { VehiclePhotoUpload } from "@/components/VehiclePhotoUpload";

const TYPE_EMOJI: Record<string, string> = { CAR: "🚗", MOTORCYCLE: "🏍️" };
const TYPE_LABEL: Record<string, string> = { CAR: "車", MOTORCYCLE: "バイク" };

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) notFound();

  const [maintenanceTypes, records] = await Promise.all([
    prisma.maintenanceType.findMany(),
    prisma.maintenanceRecord.findMany({
      where: { vehicleId: id },
      include: { maintenanceType: true },
      orderBy: { date: "desc" },
    }),
  ]);

  const statuses = computeMaintenanceStatuses(vehicle, maintenanceTypes, records);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/vehicles" className="text-sm text-neutral-500 hover:underline">
          ← 車両一覧
        </Link>
        <div className="mt-2 mb-3">
          <VehiclePhotoUpload vehicleId={vehicle.id} photoUrl={vehicle.photoUrl} />
        </div>
        <div className="flex items-start justify-between gap-2 mt-1">
          <div>
            <h1 className="text-xl font-semibold">
              {TYPE_EMOJI[vehicle.type] ?? ""} {vehicle.name}
            </h1>
            <p className="text-sm text-neutral-500">
              {TYPE_LABEL[vehicle.type] ?? vehicle.type}
              {vehicle.make ? ` ・ ${vehicle.make}` : ""}
              {vehicle.model ? ` ${vehicle.model}` : ""}
              {vehicle.year ? ` (${vehicle.year})` : ""}
            </p>
          </div>
          <Link
            href={`/vehicles/${vehicle.id}/records/new`}
            className="shrink-0 text-sm rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-3 py-1.5 font-medium"
          >
            + 整備記録を追加
          </Link>
        </div>
      </div>

      <ReminderList statuses={statuses} />

      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
        <OdometerUpdateForm vehicleId={vehicle.id} currentOdometer={vehicle.currentOdometer} />
      </div>

      <div className="space-y-3">
        <h2 className="font-medium">整備履歴</h2>
        {records.length === 0 ? (
          <p className="text-sm text-neutral-400">まだ記録がありません</p>
        ) : (
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
            {records.map((record) => (
              <li key={record.id} className="px-4 py-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">
                    {record.maintenanceType?.name ?? record.customTitle}
                  </p>
                  <DeleteButton
                    url={`/api/maintenance-records/${record.id}`}
                    confirmMessage="この整備記録を削除しますか？"
                  />
                </div>
                <p className="text-sm text-neutral-500">
                  {record.date.toLocaleDateString("ja-JP")} ・{" "}
                  {record.odometer.toLocaleString()} km
                  {record.cost != null ? ` ・ ¥${record.cost.toLocaleString()}` : ""}
                </p>
                {record.memo && (
                  <p className="text-sm text-neutral-500">{record.memo}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800">
        <DeleteButton
          url={`/api/vehicles/${vehicle.id}`}
          confirmMessage={`${vehicle.name} を削除しますか？整備記録もすべて削除されます。`}
          redirectTo="/vehicles"
          label="この車両を削除する"
        />
      </div>
    </div>
  );
}
