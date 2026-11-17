import { z } from "zod";
import { BILLING_CYCLES } from "@/lib/billing";

export const SUBSCRIPTION_STATUSES = ["active", "paused", "cancelled"] as const;

/** Solo http(s): evita esquemas como `javascript:` o `data:` (XSS). */
export function isSafeHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

// Elimina caracteres de control (salvo tab y saltos de línea) del texto libre.
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const cleanText = (s: string) => s.replace(CONTROL_CHARS, "").trim();

const text = (max: number) => z.string().transform(cleanText).pipe(z.string().min(1).max(max));

const cancelUrl = z
  .string()
  .trim()
  .max(2048)
  .refine(isSafeHttpUrl, { message: "cancelUrl debe ser una URL http o https" });

const fields = {
  name: text(100),
  price: z.number().positive().max(99_999_999.99),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "Divisa ISO de 3 letras"),
  billingCycle: z.enum(BILLING_CYCLES),
  nextBillingDate: z.coerce.date(),
  reminderDays: z.number().int().min(0).max(90),
  category: text(50),
  status: z.enum(SUBSCRIPTION_STATUSES),
  cancelUrl: cancelUrl.nullable(),
  notes: z.string().transform(cleanText).pipe(z.string().max(1000)).nullable(),
};

export const createSubscriptionSchema = z.strictObject({
  name: fields.name,
  price: fields.price,
  billingCycle: fields.billingCycle,
  nextBillingDate: fields.nextBillingDate,
  currency: fields.currency.optional(),
  reminderDays: fields.reminderDays.optional(),
  category: fields.category.optional(),
  status: fields.status.optional(),
  cancelUrl: fields.cancelUrl.optional(),
  notes: fields.notes.optional(),
});

export const updateSubscriptionSchema = z
  .strictObject({
    name: fields.name.optional(),
    price: fields.price.optional(),
    currency: fields.currency.optional(),
    billingCycle: fields.billingCycle.optional(),
    nextBillingDate: fields.nextBillingDate.optional(),
    reminderDays: fields.reminderDays.optional(),
    category: fields.category.optional(),
    status: fields.status.optional(),
    cancelUrl: fields.cancelUrl.optional(),
    notes: fields.notes.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Al menos un campo" });

export const listQuerySchema = z.strictObject({
  status: z.enum(SUBSCRIPTION_STATUSES).optional(),
});

export const idParamSchema = z.object({ id: z.string().min(1).max(64) });

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
