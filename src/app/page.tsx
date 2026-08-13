import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { computeMaintenanceStatuses } from "@/lib/maintenance";
import { ReminderList } from "@/components/ReminderList";

const TYPE_EMOJI: Record<string, string> = { CAR: "🚗", MOTORCYCLE: "🏍️" };

export default async function DashboardPage() {
  const [vehicles, maintenanceTypes, records] = await Promise.all([
    prisma.vehicle.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.maintenanceType.findMany(),
    prisma.maintenanceRecord.findMany(),
  ]);

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-neutral-500">まだ車両が登録されていません</p>
        <Link
          href="/vehicles/new"
          className="inline-block rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-2 font-medium"
        >
          + 車両を登録する
        </Link>
      </div>
    );
  }

  const vehiclesWithStatus = vehicles.map((vehicle) => {
    const vehicleRecords = records.filter((r) => r.vehicleId === vehicle.id);
    const statuses = computeMaintenanceStatuses(vehicle, maintenanceTypes, vehicleRecords);
    return { vehicle, statuses };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">ダッシュボード</h1>
        <Link
          href="/vehicles/new"
          className="text-sm rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-900"
        >
          + 車両を追加
        </Link>
      </div>

      <div className="space-y-4">
        {vehiclesWithStatus.map(({ vehicle, statuses }) => (
          <div
            key={vehicle.id}
            className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden"
          >
            {vehicle.photoUrl && (
              <Link href={`/vehicles/${vehicle.id}`}>
                {/* eslint-disable-next-line @next/next/no-img-element -- user-uploaded data URL, not a static asset */}
                <img
                  src={vehicle.photoUrl}
                  alt={vehicle.name}
                  className="w-full aspect-[16/9] object-cover"
                />
              </Link>
            )}
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/vehicles/${vehicle.id}`}
                    className="font-medium hover:underline"
                  >
                    {TYPE_EMOJI[vehicle.type] ?? ""} {vehicle.name}
                  </Link>
                  <p className="text-sm text-neutral-500">
                    走行距離 {vehicle.currentOdometer.toLocaleString()} km
                  </p>
                </div>
                <Link
                  href={`/vehicles/${vehicle.id}/records/new`}
                  className="shrink-0 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                >
                  記録を追加
                </Link>
              </div>

              {statuses.length > 0 ? (
                <ReminderList statuses={statuses} />
              ) : (
                <p className="text-sm text-neutral-400">
                  整備記録を追加すると、次回の目安がここに表示されます
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
