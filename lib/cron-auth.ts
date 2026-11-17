import { createHash, timingSafeEqual } from "node:crypto";

/** Valida `Authorization: Bearer <CRON_SECRET>` en tiempo constante. */
export function isValidCronAuth(header: string | null, secret: string | undefined): boolean {
  if (!secret || !header) return false;
  const expected = createHash("sha256").update(`Bearer ${secret}`).digest();
  const received = createHash("sha256").update(header).digest();
  return timingSafeEqual(expected, received);
}
