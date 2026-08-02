import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_COOKIE_MAX_AGE_SECONDS,
  createSessionValue,
  verifyPassword,
} from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");
  const nextParam = String(formData.get("next") ?? "/");
  const next = nextParam.startsWith("/") ? nextParam : "/";

  if (!verifyPassword(password)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "1");
    url.searchParams.set("next", next);
    return NextResponse.redirect(url, { status: 303 });
  }

  const response = NextResponse.redirect(new URL(next, request.url), {
    status: 303,
  });
  response.cookies.set(SESSION_COOKIE, createSessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
  });
  return response;
}
