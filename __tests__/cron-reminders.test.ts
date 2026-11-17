import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  subFindMany: vi.fn(),
  subUpdate: vi.fn(),
  settingsFindMany: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    subscription: { findMany: db.subFindMany, update: db.subUpdate },
    userSettings: { findMany: db.settingsFindMany },
  },
}));
const sendEmails = vi.hoisted(() => vi.fn());
vi.mock("@/lib/email", () => ({ sendEmails }));

import { GET } from "@/app/api/cron/reminders/route";
import { NextRequest } from "next/server";

const call = (token?: string) =>
  GET(
    new NextRequest("http://localhost/api/cron/reminders", {
      headers: token ? { authorization: `Bearer ${token}` } : {},
    }),
  );

const soon = new Date(Date.now() + 24 * 60 * 60 * 1000);
const row = (o: Record<string, unknown> = {}) => ({
  id: "s1",
  userId: "u1",
  name: "Netflix",
  price: { toString: () => "9.99" },
  currency: "EUR",
  billingCycle: "monthly",
  nextBillingDate: soon,
  reminderDays: 3,
  lastNotifiedFor: null,
  status: "active",
  cancelUrl: null,
  ...o,
});

beforeEach(() => {
  vi.clearAllMocks();
  process.env.CRON_SECRET = "secret-secret";
  db.settingsFindMany.mockResolvedValue([{ userId: "u1", email: "a@b.com" }]);
  sendEmails.mockResolvedValue([true]);
});

describe("GET /api/cron/reminders", () => {
  it("401 sin token o con token incorrecto, sin tocar BD", async () => {
    expect((await call()).status).toBe(401);
    expect((await call("wrong")).status).toBe(401);
    expect(db.subFindMany).not.toHaveBeenCalled();
  });
  it("401 si CRON_SECRET no está configurado", async () => {
    delete process.env.CRON_SECRET;
    expect((await call("undefined")).status).toBe(401);
  });
  it("envía el aviso, marca lastNotifiedFor y responde solo contadores", async () => {
    db.subFindMany.mockResolvedValue([row()]);
    const res = await call("secret-secret");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      rolledOver: 0,
      emailsSent: 1,
      emailsFailed: 0,
      subscriptionsNotified: 1,
      skippedNoEmail: 0,
    });
    expect(JSON.stringify(body)).not.toContain("a@b.com");
    expect(db.subUpdate).toHaveBeenCalledWith({
      where: { id: "s1" },
      data: { lastNotifiedFor: soon },
    });
  });
  it("no duplica en una segunda ejecución", async () => {
    db.subFindMany.mockResolvedValue([row({ lastNotifiedFor: soon })]);
    const body = await (await call("secret-secret")).json();
    expect(body.emailsSent).toBe(0);
    expect(sendEmails).not.toHaveBeenCalled();
  });
  it("omite usuarios sin email", async () => {
    db.subFindMany.mockResolvedValue([row()]);
    db.settingsFindMany.mockResolvedValue([{ userId: "u1", email: null }]);
    const body = await (await call("secret-secret")).json();
    expect(body.skippedNoEmail).toBe(1);
    expect(sendEmails).not.toHaveBeenCalled();
    expect(db.subUpdate).not.toHaveBeenCalled();
  });
  it("no marca notificada si el envío falla", async () => {
    db.subFindMany.mockResolvedValue([row()]);
    sendEmails.mockResolvedValue([false]);
    const body = await (await call("secret-secret")).json();
    expect(body.emailsFailed).toBe(1);
    expect(db.subUpdate).not.toHaveBeenCalled();
  });
  it("avanza cobros pasados", async () => {
    db.subFindMany.mockResolvedValue([row({ nextBillingDate: new Date("2020-01-15T00:00:00Z") })]);
    const body = await (await call("secret-secret")).json();
    expect(body.rolledOver).toBe(1);
  });
});
