import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MaintenanceRecordForm } from "@/components/MaintenanceRecordForm";

export default async function NewMaintenanceRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [vehicle, maintenanceTypes] = await Promise.all([
    prisma.vehicle.findUnique({ where: { id } }),
    prisma.maintenanceType.findMany({ orderBy: [{ isCustom: "asc" }, { createdAt: "asc" }] }),
  ]);

  if (!vehicle) notFound();

  return (
    <div className="max-w-md space-y-6">
      <div>
        <Link href={`/vehicles/${id}`} className="text-sm text-neutral-500 hover:underline">
          ← {vehicle.name}
        </Link>
        <h1 className="text-xl font-semibold mt-1">整備記録を追加</h1>
      </div>

      <MaintenanceRecordForm
        vehicleId={vehicle.id}
        currentOdometer={vehicle.currentOdometer}
        maintenanceTypes={maintenanceTypes}
      />
    </div>
  );
}
