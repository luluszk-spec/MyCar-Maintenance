import { prisma } from "@/lib/prisma";

const TYPE_EMOJI: Record<string, string> = { CAR: "🚗", MOTORCYCLE: "🏍️" };

export default async function CostsPage() {
  const [vehicles, records] = await Promise.all([
    prisma.vehicle.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.maintenanceRecord.findMany({ where: { cost: { not: null } } }),
  ]);

  const vehicleById = new Map(vehicles.map((v) => [v.id, v]));

  // year -> vehicleId -> total cost
  const byYear = new Map<number, Map<string, number>>();
  let grandTotal = 0;

  for (const record of records) {
    if (record.cost == null) continue;
    const year = record.date.getFullYear();
    if (!byYear.has(year)) byYear.set(year, new Map());
    const vehicleTotals = byYear.get(year)!;
    vehicleTotals.set(record.vehicleId, (vehicleTotals.get(record.vehicleId) ?? 0) + record.cost);
    grandTotal += record.cost;
  }

  const years = [...byYear.keys()].sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">コスト集計</h1>

      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
        <p className="text-sm text-neutral-500">総整備費用</p>
        <p className="text-2xl font-semibold">¥{grandTotal.toLocaleString()}</p>
      </div>

      {years.length === 0 ? (
        <p className="text-sm text-neutral-400">費用が記録された整備記録がまだありません</p>
      ) : (
        <div className="space-y-4">
          {years.map((year) => {
            const vehicleTotals = byYear.get(year)!;
            const yearTotal = [...vehicleTotals.values()].reduce((a, b) => a + b, 0);
            return (
              <div
                key={year}
                className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-medium">{year}年</h2>
                  <p className="font-medium">¥{yearTotal.toLocaleString()}</p>
                </div>
                <ul className="space-y-1">
                  {[...vehicleTotals.entries()]
                    .sort((a, b) => b[1] - a[1])
                    .map(([vehicleId, total]) => {
                      const vehicle = vehicleById.get(vehicleId);
                      return (
                        <li
                          key={vehicleId}
                          className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400"
                        >
                          <span>
                            {vehicle ? `${TYPE_EMOJI[vehicle.type] ?? ""} ${vehicle.name}` : "削除された車両"}
                          </span>
                          <span>¥{total.toLocaleString()}</span>
                        </li>
                      );
                    })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
