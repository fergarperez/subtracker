// Pure route classification used by proxy.ts (testable without Clerk).

/** Páginas que requieren sesión. */
export function isProtectedPage(pathname: string): boolean {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

/** Endpoints privados que requieren sesión de Clerk (401 si no hay). */
export function isPrivateApi(pathname: string): boolean {
  if (pathname !== "/api" && !pathname.startsWith("/api/")) return false;
  // /api/cron/* se protege con CRON_SECRET (Bearer), no con Clerk.
  return !(pathname === "/api/cron" || pathname.startsWith("/api/cron/"));
}
