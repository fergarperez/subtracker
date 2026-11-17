import { auth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  badRequest,
  notFound,
  readJson,
  toSubscriptionDto,
  unauthorized,
} from "@/lib/subscriptions";
import { idParamSchema, updateSubscriptionSchema } from "@/lib/validations/subscription";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  const params = idParamSchema.safeParse(await ctx.params);
  if (!params.success) return badRequest(params.error);

  const row = await prisma.subscription.findFirst({ where: { id: params.data.id, userId } });
  return row ? NextResponse.json(toSubscriptionDto(row)) : notFound();
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  const params = idParamSchema.safeParse(await ctx.params);
  if (!params.success) return badRequest(params.error);

  const body = updateSubscriptionSchema.safeParse(await readJson(req));
  if (!body.success) return badRequest(body.error);

  // updateMany con { id, userId }: un acceso cruzado afecta a 0 filas -> 404.
  const { count } = await prisma.subscription.updateMany({
    where: { id: params.data.id, userId },
    data: body.data,
  });
  if (count === 0) return notFound();

  const row = await prisma.subscription.findFirst({ where: { id: params.data.id, userId } });
  return row ? NextResponse.json(toSubscriptionDto(row)) : notFound();
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  const params = idParamSchema.safeParse(await ctx.params);
  if (!params.success) return badRequest(params.error);

  const { count } = await prisma.subscription.deleteMany({
    where: { id: params.data.id, userId },
  });
  return count === 0 ? notFound() : new NextResponse(null, { status: 204 });
}
