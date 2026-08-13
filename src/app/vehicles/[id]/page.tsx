import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { computeMaintenanceStatuses } from "@/lib/maintenance";
import { ReminderList } from "@/components/ReminderList";
import { OdometerUpdateForm } from "@/components/OdometerUpdateForm";
import { DeleteButton } from "@/components/DeleteButton";
import { VehiclePhotoUpload } from "@/components/VehiclePhotoUpload";
import { MaintenanceHistoryList } from "@/components/MaintenanceHistoryList";
import { VehicleInfoSection } from "@/components/VehicleInfoSection";
import { getCurrentUserId } from "@/lib/session";

const TYPE_EMOJI: Record<string, string> = { CAR: "🚗", MOTORCYCLE: "🏍️" };

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const { id } = await params;

  const vehicle = await prisma.vehicle.findFirst({ where: { id, userId } });
  if (!vehicle) notFound();

  const [maintenanceTypes, records] = await Promise.all([
    prisma.maintenanceType.findMany({ where: { userId } }),
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
            <VehicleInfoSection
              vehicle={{
                id: vehicle.id,
                type: vehicle.type,
                make: vehicle.make,
                model: vehicle.model,
                year: vehicle.year,
                grade: vehicle.grade,
                plateNumber: vehicle.plateNumber,
                purchaseDate: vehicle.purchaseDate ? vehicle.purchaseDate.toISOString() : null,
              }}
            />
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

      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-3">
        <OdometerUpdateForm vehicleId={vehicle.id} currentOdometer={vehicle.currentOdometer} />
      </div>

      <div className="space-y-3">
        <h2 className="font-medium">整備履歴</h2>
        <MaintenanceHistoryList records={records} />
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
