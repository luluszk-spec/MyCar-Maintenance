import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE,
  SESSION_COOKIE_MAX_AGE_SECONDS,
  createSessionValue,
  hashPassword,
} from "@/lib/auth";
import { DEFAULT_MAINTENANCE_TYPES } from "@/lib/defaultMaintenanceTypes";

function redirectWithError(request: Request, error: string) {
  const url = new URL("/signup", request.url);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !email.includes("@")) {
    return redirectWithError(request, "invalid");
  }
  if (password.length < 8) {
    return redirectWithError(request, "weak_password");
  }

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { email, name: name || null, passwordHash: hashPassword(password) },
    });

    await tx.maintenanceType.createMany({
      data: DEFAULT_MAINTENANCE_TYPES.map((t) => ({
        userId: created.id,
        name: t.name,
        vehicleType: t.vehicleType,
        defaultIntervalKm: t.defaultIntervalKm,
        defaultIntervalMonths: t.defaultIntervalMonths,
        isCustom: false,
      })),
    });

    return created;
  }).catch((err) => {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return null;
    }
    throw err;
  });

  if (!user) {
    return redirectWithError(request, "email_taken");
  }

  const response = NextResponse.redirect(new URL("/", request.url), { status: 303 });
  response.cookies.set(SESSION_COOKIE, createSessionValue(user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
  });
  return response;
}
