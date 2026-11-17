import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isPrivateApi, isProtectedPage } from "@/lib/route-access";

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  if (isPrivateApi(pathname)) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return;
  }

  if (isProtectedPage(pathname)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Omite internals de Next y archivos estáticos
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
