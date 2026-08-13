import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const types = await prisma.maintenanceType.findMany({
    where: { userId },
    orderBy: [{ isCustom: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(types);
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const isCheckOnly = body.isCheckOnly === true;

  const type = await prisma.maintenanceType.create({
    data: {
      userId,
      name,
      defaultIntervalKm:
        !isCheckOnly && Number.isFinite(body.defaultIntervalKm)
          ? Math.trunc(body.defaultIntervalKm)
          : null,
      defaultIntervalMonths: Number.isFinite(body.defaultIntervalMonths)
        ? Math.trunc(body.defaultIntervalMonths)
        : null,
      isCustom: true,
      isCheckOnly,
    },
  });

  return NextResponse.json(type, { status: 201 });
}
