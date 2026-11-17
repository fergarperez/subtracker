import { describe, expect, it } from "vitest";
import {
  planReminders,
  buildReminderEmail,
  buildDemoReminders,
  type ReminderSubscription,
} from "@/lib/reminders";

const now = new Date("2026-11-17T07:00:00Z");
const sub = (o: Partial<ReminderSubscription> = {}): ReminderSubscription => ({
  id: "s1",
  userId: "u1",
  name: "Netflix",
  price: 12.99,
  currency: "EUR",
  billingCycle: "monthly",
  nextBillingDate: new Date("2026-11-19T00:00:00Z"),
  reminderDays: 3,
  lastNotifiedFor: null,
  status: "active",
  cancelUrl: null,
  ...o,
});

describe("planReminders", () => {
  it("avisa dentro de la ventana", () => {
    const p = planReminders([sub()], now);
    expect(p.byUser.get("u1")).toHaveLength(1);
    expect(p.rollovers).toHaveLength(0);
  });
  it("no avisa fuera de la ventana", () => {
    expect(planReminders([sub({ reminderDays: 1 })], now).byUser.size).toBe(0);
  });
  it("no avisa si ya se notificó ese cobro (idempotente)", () => {
    const d = new Date("2026-11-19T00:00:00Z");
    expect(planReminders([sub({ lastNotifiedFor: d })], now).byUser.size).toBe(0);
  });
  it("avisa de nuevo si lastNotifiedFor es de un ciclo anterior", () => {
    const old = new Date("2026-10-19T00:00:00Z");
    expect(planReminders([sub({ lastNotifiedFor: old })], now).byUser.size).toBe(1);
  });
  it("ignora pausadas y canceladas", () => {
    const p = planReminders([sub({ status: "paused" }), sub({ status: "cancelled" })], now);
    expect(p.byUser.size).toBe(0);
    expect(p.rollovers).toHaveLength(0);
  });
  it("avanza cobros pasados sin avisar del pasado", () => {
    const p = planReminders([sub({ nextBillingDate: new Date("2026-11-10T00:00:00Z") })], now);
    expect(p.rollovers).toEqual([{ id: "s1", nextBillingDate: new Date("2026-12-10T00:00:00Z") }]);
    expect(p.byUser.size).toBe(0);
  });
  it("tras el rollover avisa si el nuevo cobro cae en la ventana", () => {
    const p = planReminders(
      [sub({ billingCycle: "weekly", reminderDays: 7, nextBillingDate: new Date("2026-11-15T00:00:00Z") })],
      now,
    );
    expect(p.rollovers[0].nextBillingDate).toEqual(new Date("2026-11-22T00:00:00Z"));
    expect(p.byUser.get("u1")![0].billingDate).toEqual(new Date("2026-11-22T00:00:00Z"));
  });
  it("agrupa por usuario y ordena por fecha", () => {
    const p = planReminders(
      [
        sub({ id: "a", nextBillingDate: new Date("2026-11-20T00:00:00Z") }),
        sub({ id: "b", nextBillingDate: new Date("2026-11-18T00:00:00Z") }),
        sub({ id: "c", userId: "u2" }),
      ],
      now,
    );
    expect(p.byUser.get("u1")!.map((i) => i.id)).toEqual(["b", "a"]);
    expect(p.byUser.get("u2")).toHaveLength(1);
  });
});

describe("buildReminderEmail", () => {
  const item = {
    id: "1",
    name: "<b>X</b>",
    price: 5,
    currency: "EUR",
    billingDate: new Date("2026-11-19T00:00:00Z"),
    cancelUrl: "https://x.com/c" as string | null,
  };
  it("asunto singular/plural y escapa HTML", () => {
    const one = buildReminderEmail([item]);
    expect(one.subject).toContain("Próximo cobro");
    expect(one.html).not.toContain("<b>X</b>");
    expect(one.html).toContain("https://x.com/c");
    expect(buildReminderEmail([item, item]).subject).toBe("Tienes 2 cobros próximos");
  });
  it("no incluye enlaces con protocolo no http(s)", () => {
    const e = buildReminderEmail([{ ...item, cancelUrl: "javascript:alert(1)" }]);
    expect(e.html).not.toContain("javascript:");
  });
});

describe("buildDemoReminders", () => {
  it("genera un aviso de ejemplo para mañana, sin enlaces ni datos reales", () => {
    const items = buildDemoReminders(new Date("2026-11-17T15:30:00Z"));
    expect(items).toHaveLength(1);
    expect(items[0].billingDate.toISOString()).toBe("2026-11-18T00:00:00.000Z");
    expect(items[0].cancelUrl).toBeNull();
  });
  it("es compatible con la plantilla real del email", () => {
    const email = buildReminderEmail(buildDemoReminders(now));
    expect(email.subject).toBe("Próximo cobro: Netflix");
    expect(email.text).toContain("12,99");
  });
});
