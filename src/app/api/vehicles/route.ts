import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const vehicles = await prisma.vehicle.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(vehicles);
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const type =
    body.type === "MOTORCYCLE" ? "MOTORCYCLE" : body.type === "CAR" ? "CAR" : null;

  if (!name || !type) {
    return NextResponse.json({ error: "name and type are required" }, { status: 400 });
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      name,
      type,
      make: typeof body.make === "string" ? body.make.trim() || null : null,
      model: typeof body.model === "string" ? body.model.trim() || null : null,
      year: Number.isFinite(body.year) ? Math.trunc(body.year) : null,
      currentOdometer: Number.isFinite(body.currentOdometer)
        ? Math.max(0, Math.trunc(body.currentOdometer))
        : 0,
    },
  });

  return NextResponse.json(vehicle, { status: 201 });
}
