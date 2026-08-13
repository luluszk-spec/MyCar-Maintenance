import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const vehicleId = searchParams.get("vehicleId");

  const records = await prisma.maintenanceRecord.findMany({
    where: { vehicle: { userId, ...(vehicleId ? { id: vehicleId } : {}) } },
    include: { maintenanceType: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(records);
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json();

  const vehicleId = typeof body.vehicleId === "string" ? body.vehicleId : "";
  const maintenanceTypeId =
    typeof body.maintenanceTypeId === "string" && body.maintenanceTypeId
      ? body.maintenanceTypeId
      : null;
  const customTitle = typeof body.customTitle === "string" ? body.customTitle.trim() : "";
  const dateValue = typeof body.date === "string" ? new Date(body.date) : null;
  const odometer = Number.isFinite(body.odometer) ? Math.trunc(body.odometer) : null;

  if (!vehicleId || !dateValue || Number.isNaN(dateValue.getTime()) || odometer == null) {
    return NextResponse.json(
      { error: "vehicleId, date, odometer are required" },
      { status: 400 }
    );
  }
  if (!maintenanceTypeId && !customTitle) {
    return NextResponse.json(
      { error: "maintenanceTypeId or customTitle is required" },
      { status: 400 }
    );
  }

  const vehicle = await prisma.vehicle.findFirst({ where: { id: vehicleId, userId } });
  if (!vehicle) return NextResponse.json({ error: "vehicle not found" }, { status: 404 });

  const record = await prisma.$transaction(async (tx) => {
    const created = await tx.maintenanceRecord.create({
      data: {
        vehicleId,
        maintenanceTypeId,
        customTitle: maintenanceTypeId ? null : customTitle,
        date: dateValue,
        odometer,
        cost: Number.isFinite(body.cost) ? Math.max(0, Math.trunc(body.cost)) : null,
        memo: typeof body.memo === "string" ? body.memo.trim() || null : null,
      },
    });

    if (odometer > vehicle.currentOdometer) {
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { currentOdometer: odometer },
      });
    }

    return created;
  });

  return NextResponse.json(record, { status: 201 });
}
