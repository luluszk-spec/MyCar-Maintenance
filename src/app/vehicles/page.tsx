import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

const TYPE_EMOJI: Record<string, string> = { CAR: "🚗", MOTORCYCLE: "🏍️" };
const TYPE_LABEL: Record<string, string> = { CAR: "車", MOTORCYCLE: "バイク" };

export default async function VehiclesPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const vehicles = await prisma.vehicle.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">車両</h1>
        <Link
          href="/vehicles/new"
          className="text-sm rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-900"
        >
          + 車両を追加
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <p className="text-neutral-500 text-sm">まだ車両が登録されていません</p>
      ) : (
        <div className="space-y-4">
          {vehicles.map((vehicle) => (
            <Link
              key={vehicle.id}
              href={`/vehicles/${vehicle.id}`}
              className="block border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden hover:bg-neutral-50 dark:hover:bg-neutral-900"
            >
              {vehicle.photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- user-uploaded data URL, not a static asset
                <img
                  src={vehicle.photoUrl}
                  alt={vehicle.name}
                  className="w-full aspect-[16/9] object-cover"
                />
              )}
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-medium">
                    {TYPE_EMOJI[vehicle.type] ?? ""} {vehicle.name}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {TYPE_LABEL[vehicle.type] ?? vehicle.type}
                    {vehicle.make ? ` ・ ${vehicle.make}` : ""}
                    {vehicle.model ? ` ${vehicle.model}` : ""}
                    {vehicle.year ? ` (${vehicle.year})` : ""}
                  </p>
                </div>
                <p className="text-sm text-neutral-500 shrink-0">
                  {vehicle.currentOdometer.toLocaleString()} km
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
