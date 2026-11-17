import { NextResponse } from "next/server";
import type { ZodError } from "zod";

type SubscriptionRow = {
  id: string;
  name: string;
  price: { toString(): string };
  currency: string;
  billingCycle: string;
  nextBillingDate: Date;
  reminderDays: number;
  category: string;
  status: string;
  cancelUrl: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/** DTO público: no expone `userId` ni `lastNotifiedFor`; `price` como número. */
export function toSubscriptionDto(s: SubscriptionRow) {
  return {
    id: s.id,
    name: s.name,
    price: Number(s.price.toString()),
    currency: s.currency,
    billingCycle: s.billingCycle,
    nextBillingDate: s.nextBillingDate.toISOString(),
    reminderDays: s.reminderDays,
    category: s.category,
    status: s.status,
    cancelUrl: s.cancelUrl,
    notes: s.notes,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
export const notFound = () => NextResponse.json({ error: "Not found" }, { status: 404 });
export const badRequest = (error: ZodError) =>
  NextResponse.json({ error: "Invalid request", details: error.issues }, { status: 400 });

/** Lee JSON del body; devuelve `undefined` si no es JSON válido. */
export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return undefined;
  }
}
