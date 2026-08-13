import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getUserLabel = cache(async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });
  return user ? user.name || user.email : null;
});
