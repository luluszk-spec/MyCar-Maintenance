import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const type = await prisma.maintenanceType.findUnique({ where: { id } });
  if (!type) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!type.isCustom) {
    return NextResponse.json(
      { error: "default items cannot be deleted" },
      { status: 400 }
    );
  }
  await prisma.maintenanceType.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
