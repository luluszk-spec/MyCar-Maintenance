import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const vehicle = await prisma.vehicle.findFirst({ where: { id, userId } });
  if (!vehicle) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(vehicle);
}

export async function PATCH(request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (body.type === "CAR" || body.type === "MOTORCYCLE") data.type = body.type;
  if (typeof body.make === "string") data.make = body.make.trim() || null;
  if (typeof body.model === "string") data.model = body.model.trim() || null;
  if (body.year === null || Number.isFinite(body.year)) {
    data.year = body.year == null ? null : Math.trunc(body.year);
  }
  if (typeof body.grade === "string") data.grade = body.grade.trim() || null;
  if (typeof body.plateNumber === "string") data.plateNumber = body.plateNumber.trim() || null;
  if (body.purchaseDate === null) {
    data.purchaseDate = null;
  } else if (typeof body.purchaseDate === "string" && body.purchaseDate) {
    data.purchaseDate = new Date(body.purchaseDate);
  }
  if (Number.isFinite(body.currentOdometer)) {
    data.currentOdometer = Math.max(0, Math.trunc(body.currentOdometer));
  }
  if (body.photoUrl === null) {
    data.photoUrl = null;
  } else if (typeof body.photoUrl === "string" && body.photoUrl.startsWith("data:image/")) {
    if (body.photoUrl.length > 3_000_000) {
      return NextResponse.json({ error: "画像サイズが大きすぎます" }, { status: 400 });
    }
    data.photoUrl = body.photoUrl;
  }

  const { count } = await prisma.vehicle.updateMany({ where: { id, userId }, data });
  if (count === 0) return NextResponse.json({ error: "not found" }, { status: 404 });

  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  return NextResponse.json(vehicle);
}

export async function DELETE(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const { count } = await prisma.vehicle.deleteMany({ where: { id, userId } });
  if (count === 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
