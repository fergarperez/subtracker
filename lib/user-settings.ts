import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const REFRESH_MS = 24 * 60 * 60 * 1000;

/**
 * Crea/actualiza `UserSettings` con el email de Clerk. Se llama en peticiones
 * autenticadas; solo consulta a Clerk si no hay email o el dato tiene > 24 h.
 * Nunca falla la petición del usuario.
 */
export async function syncUserEmail(userId: string): Promise<void> {
  try {
    const existing = await prisma.userSettings.findUnique({ where: { userId } });
    if (existing?.email && Date.now() - existing.updatedAt.getTime() < REFRESH_MS) return;

    const user = await currentUser();
    const email =
      user?.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ??
      user?.emailAddresses[0]?.emailAddress ??
      null;

    await prisma.userSettings.upsert({
      where: { userId },
      create: { userId, email },
      update: { email },
    });
  } catch (err) {
    console.error("syncUserEmail failed", err instanceof Error ? err.message : "unknown");
  }
}
