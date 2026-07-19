import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Returns the full DB user for the current session, or null. */
export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({
    where: { id: session.user.id },
    include: { playerProfile: true },
  });
}

/** Returns the session user id or null (lightweight, no DB hit). */
export async function getCurrentUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}
