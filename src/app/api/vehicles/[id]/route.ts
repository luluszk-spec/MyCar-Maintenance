import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(vehicle);
}

export async function PATCH(request: Request, { params }: Params) {
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

  try {
    const vehicle = await prisma.vehicle.update({ where: { id }, data });
    return NextResponse.json(vehicle);
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.vehicle.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
