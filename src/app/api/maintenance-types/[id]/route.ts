import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) {
    data.name = body.name.trim();
  }
  if (body.defaultIntervalKm === null || Number.isFinite(body.defaultIntervalKm)) {
    data.defaultIntervalKm =
      body.defaultIntervalKm == null ? null : Math.trunc(body.defaultIntervalKm);
  }
  if (body.defaultIntervalMonths === null || Number.isFinite(body.defaultIntervalMonths)) {
    data.defaultIntervalMonths =
      body.defaultIntervalMonths == null ? null : Math.trunc(body.defaultIntervalMonths);
  }

  try {
    const type = await prisma.maintenanceType.update({ where: { id }, data });
    return NextResponse.json(type);
  } catch {
    return NextResponse.json({ error: "見つかりませんでした" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const type = await prisma.maintenanceType.findUnique({ where: { id } });
  if (!type) return NextResponse.json({ error: "見つかりませんでした" }, { status: 404 });
  if (!type.isCustom) {
    return NextResponse.json(
      { error: "既定の項目は削除できません" },
      { status: 400 }
    );
  }

  try {
    await prisma.maintenanceType.delete({ where: { id } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return NextResponse.json(
        {
          error:
            "この項目を使った整備記録があるため削除できません。先にその記録を削除してください。",
        },
        { status: 409 }
      );
    }
    throw err;
  }

  return NextResponse.json({ ok: true });
}
