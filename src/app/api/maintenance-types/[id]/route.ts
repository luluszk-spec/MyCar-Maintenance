import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) {
    data.name = body.name.trim();
  }
  if (typeof body.isCheckOnly === "boolean") {
    data.isCheckOnly = body.isCheckOnly;
  }
  const isCheckOnly = body.isCheckOnly === true;
  if (isCheckOnly) {
    data.defaultIntervalKm = null;
  } else if (body.defaultIntervalKm === null || Number.isFinite(body.defaultIntervalKm)) {
    data.defaultIntervalKm =
      body.defaultIntervalKm == null ? null : Math.trunc(body.defaultIntervalKm);
  }
  if (body.defaultIntervalMonths === null || Number.isFinite(body.defaultIntervalMonths)) {
    data.defaultIntervalMonths =
      body.defaultIntervalMonths == null ? null : Math.trunc(body.defaultIntervalMonths);
  }

  const { count } = await prisma.maintenanceType.updateMany({
    where: { id, userId },
    data,
  });
  if (count === 0) {
    return NextResponse.json({ error: "見つかりませんでした" }, { status: 404 });
  }

  const type = await prisma.maintenanceType.findUnique({ where: { id } });
  return NextResponse.json(type);
}

export async function DELETE(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const type = await prisma.maintenanceType.findFirst({ where: { id, userId } });
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
