import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionValue } from "@/lib/auth";

/** Reads and verifies the session cookie. Returns null when not logged in. */
export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = verifySessionValue(cookieStore.get(SESSION_COOKIE)?.value);
  return session?.userId ?? null;
}
