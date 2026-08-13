import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const vehicles = await prisma.vehicle.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(vehicles);
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const type =
    body.type === "MOTORCYCLE" ? "MOTORCYCLE" : body.type === "CAR" ? "CAR" : null;

  if (!name || !type) {
    return NextResponse.json({ error: "name and type are required" }, { status: 400 });
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      userId,
      name,
      type,
      make: typeof body.make === "string" ? body.make.trim() || null : null,
      model: typeof body.model === "string" ? body.model.trim() || null : null,
      year: Number.isFinite(body.year) ? Math.trunc(body.year) : null,
      grade: typeof body.grade === "string" ? body.grade.trim() || null : null,
      plateNumber:
        typeof body.plateNumber === "string" ? body.plateNumber.trim() || null : null,
      purchaseDate:
        typeof body.purchaseDate === "string" && body.purchaseDate
          ? new Date(body.purchaseDate)
          : null,
      currentOdometer: Number.isFinite(body.currentOdometer)
        ? Math.max(0, Math.trunc(body.currentOdometer))
        : 0,
    },
  });

  return NextResponse.json(vehicle, { status: 201 });
}
