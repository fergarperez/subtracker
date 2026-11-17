import { auth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncUserEmail } from "@/lib/user-settings";
import { badRequest, readJson, toSubscriptionDto, unauthorized } from "@/lib/subscriptions";
import { createSubscriptionSchema, listQuerySchema } from "@/lib/validations/subscription";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return unauthorized();
  await syncUserEmail(userId);

  const query = listQuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!query.success) return badRequest(query.error);

  const rows = await prisma.subscription.findMany({
    where: { userId, ...(query.data.status && { status: query.data.status }) },
    orderBy: { nextBillingDate: "asc" },
  });
  return NextResponse.json(rows.map(toSubscriptionDto));
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  const parsed = createSubscriptionSchema.safeParse(await readJson(req));
  if (!parsed.success) return badRequest(parsed.error);

  // userId siempre sale de la sesión, nunca del body (strictObject lo rechaza).
  const row = await prisma.subscription.create({ data: { ...parsed.data, userId } });
  return NextResponse.json(toSubscriptionDto(row), { status: 201 });
}
