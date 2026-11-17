import { describe, expect, it } from "vitest";
import {
  createSubscriptionSchema,
  isSafeHttpUrl,
  listQuerySchema,
  updateSubscriptionSchema,
} from "@/lib/validations/subscription";

const valid = {
  name: "Netflix",
  price: 12.99,
  billingCycle: "monthly",
  nextBillingDate: "2026-12-01",
};

describe("isSafeHttpUrl", () => {
  it("acepta http y https", () => {
    expect(isSafeHttpUrl("https://example.com/cancel")).toBe(true);
    expect(isSafeHttpUrl("http://example.com")).toBe(true);
  });
  it("rechaza esquemas peligrosos y basura", () => {
    expect(isSafeHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeHttpUrl("JaVaScRiPt:alert(1)")).toBe(false);
    expect(isSafeHttpUrl("data:text/html,<script>")).toBe(false);
    expect(isSafeHttpUrl("ftp://example.com")).toBe(false);
    expect(isSafeHttpUrl("example.com")).toBe(false);
    expect(isSafeHttpUrl("")).toBe(false);
  });
});

describe("createSubscriptionSchema", () => {
  it("acepta el mínimo y deja los defaults a Prisma", () => {
    const r = createSubscriptionSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.nextBillingDate).toBeInstanceOf(Date);
      expect(r.data.currency).toBeUndefined();
    }
  });
  it("normaliza texto y divisa", () => {
    const r = createSubscriptionSchema.parse({
      ...valid,
      name: "  Spotify \u0000 ",
      currency: " usd ",
      category: " Música ",
    });
    expect(r.name).toBe("Spotify");
    expect(r.currency).toBe("USD");
    expect(r.category).toBe("Música");
  });
  it("rechaza campos obligatorios ausentes", () => {
    expect(createSubscriptionSchema.safeParse({}).success).toBe(false);
  });
  it("rechaza precio no positivo, NaN o string", () => {
    for (const price of [0, -1, "10", Number.NaN, 1e12]) {
      expect(createSubscriptionSchema.safeParse({ ...valid, price }).success).toBe(false);
    }
  });
  it("rechaza ciclo, estado y divisa inválidos", () => {
    expect(createSubscriptionSchema.safeParse({ ...valid, billingCycle: "daily" }).success).toBe(false);
    expect(createSubscriptionSchema.safeParse({ ...valid, status: "deleted" }).success).toBe(false);
    expect(createSubscriptionSchema.safeParse({ ...valid, currency: "EURO" }).success).toBe(false);
  });
  it("rechaza fecha inválida y reminderDays fuera de rango", () => {
    expect(createSubscriptionSchema.safeParse({ ...valid, nextBillingDate: "nope" }).success).toBe(false);
    expect(createSubscriptionSchema.safeParse({ ...valid, reminderDays: -1 }).success).toBe(false);
    expect(createSubscriptionSchema.safeParse({ ...valid, reminderDays: 1.5 }).success).toBe(false);
  });
  it("rechaza cancelUrl con javascript: pero admite null", () => {
    expect(
      createSubscriptionSchema.safeParse({ ...valid, cancelUrl: "javascript:alert(1)" }).success,
    ).toBe(false);
    expect(createSubscriptionSchema.safeParse({ ...valid, cancelUrl: null }).success).toBe(true);
    expect(
      createSubscriptionSchema.safeParse({ ...valid, cancelUrl: "https://x.com/c" }).success,
    ).toBe(true);
  });
  it("rechaza campos desconocidos, incluido userId (mass assignment)", () => {
    expect(createSubscriptionSchema.safeParse({ ...valid, userId: "user_other" }).success).toBe(false);
    expect(createSubscriptionSchema.safeParse({ ...valid, lastNotifiedFor: "2026-01-01" }).success).toBe(
      false,
    );
  });
});

describe("updateSubscriptionSchema", () => {
  it("acepta actualizaciones parciales", () => {
    expect(updateSubscriptionSchema.safeParse({ status: "paused" }).success).toBe(true);
  });
  it("rechaza body vacío", () => {
    expect(updateSubscriptionSchema.safeParse({}).success).toBe(false);
  });
  it("rechaza userId y valores inválidos", () => {
    expect(updateSubscriptionSchema.safeParse({ userId: "x" }).success).toBe(false);
    expect(updateSubscriptionSchema.safeParse({ cancelUrl: "javascript:1" }).success).toBe(false);
  });
});

describe("listQuerySchema", () => {
  it("acepta status válido o ausente", () => {
    expect(listQuerySchema.safeParse({}).success).toBe(true);
    expect(listQuerySchema.safeParse({ status: "active" }).success).toBe(true);
  });
  it("rechaza status o parámetros desconocidos", () => {
    expect(listQuerySchema.safeParse({ status: "x" }).success).toBe(false);
    expect(listQuerySchema.safeParse({ userId: "x" }).success).toBe(false);
  });
});
