import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const types = await prisma.maintenanceType.findMany({
    orderBy: [{ isCustom: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(types);
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const type = await prisma.maintenanceType.create({
    data: {
      name,
      defaultIntervalKm: Number.isFinite(body.defaultIntervalKm)
        ? Math.trunc(body.defaultIntervalKm)
        : null,
      defaultIntervalMonths: Number.isFinite(body.defaultIntervalMonths)
        ? Math.trunc(body.defaultIntervalMonths)
        : null,
      isCustom: true,
    },
  });

  return NextResponse.json(type, { status: 201 });
}
