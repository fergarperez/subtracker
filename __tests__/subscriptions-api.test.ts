import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
vi.mock("@clerk/nextjs/server", () => ({ auth: () => authMock() }));

const db = vi.hoisted(() => ({
  findMany: vi.fn(),
  findFirst: vi.fn(),
  create: vi.fn(),
  updateMany: vi.fn(),
  deleteMany: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({ prisma: { subscription: db } }));

import { GET, POST } from "@/app/api/subscriptions/route";
import { DELETE, GET as GET_ONE, PATCH } from "@/app/api/subscriptions/[id]/route";
import { NextRequest } from "next/server";

const row = (over: Record<string, unknown> = {}) => ({
  id: "sub1",
  userId: "user_a",
  name: "Netflix",
  price: { toString: () => "12.99" },
  currency: "EUR",
  billingCycle: "monthly",
  nextBillingDate: new Date("2026-12-01T00:00:00Z"),
  reminderDays: 3,
  lastNotifiedFor: null,
  category: "General",
  status: "active",
  cancelUrl: null,
  notes: null,
  createdAt: new Date("2026-11-01T00:00:00Z"),
  updatedAt: new Date("2026-11-01T00:00:00Z"),
  ...over,
});

const req = (url: string, method = "GET", body?: unknown) =>
  new NextRequest(`http://localhost${url}`, {
    method,
    ...(body !== undefined && {
      body: typeof body === "string" ? body : JSON.stringify(body),
      headers: { "content-type": "application/json" },
    }),
  });
const ctx = (id = "sub1") => ({ params: Promise.resolve({ id }) });

const validBody = {
  name: "Netflix",
  price: 12.99,
  billingCycle: "monthly",
  nextBillingDate: "2026-12-01",
};

beforeEach(() => {
  vi.clearAllMocks();
  authMock.mockResolvedValue({ userId: "user_a" });
});

describe("sin sesión -> 401", () => {
  beforeEach(() => authMock.mockResolvedValue({ userId: null }));

  it("todos los handlers devuelven 401 sin tocar la BD", async () => {
    const responses = [
      await GET(req("/api/subscriptions")),
      await POST(req("/api/subscriptions", "POST", validBody)),
      await GET_ONE(req("/api/subscriptions/sub1"), ctx()),
      await PATCH(req("/api/subscriptions/sub1", "PATCH", { status: "paused" }), ctx()),
      await DELETE(req("/api/subscriptions/sub1", "DELETE"), ctx()),
    ];
    for (const r of responses) expect(r.status).toBe(401);
    for (const fn of Object.values(db)) expect(fn).not.toHaveBeenCalled();
  });
});

describe("GET /api/subscriptions", () => {
  it("filtra siempre por userId de la sesión y no filtra datos internos", async () => {
    db.findMany.mockResolvedValue([row()]);
    const res = await GET(req("/api/subscriptions?status=active"));
    expect(res.status).toBe(200);
    expect(db.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user_a", status: "active" } }),
    );
    const [item] = await res.json();
    expect(item.price).toBe(12.99);
    expect(item).not.toHaveProperty("userId");
    expect(item).not.toHaveProperty("lastNotifiedFor");
  });
  it("400 ante status inválido", async () => {
    expect((await GET(req("/api/subscriptions?status=zzz"))).status).toBe(400);
    expect(db.findMany).not.toHaveBeenCalled();
  });
});

describe("POST /api/subscriptions", () => {
  it("crea con el userId de la sesión", async () => {
    db.create.mockResolvedValue(row());
    const res = await POST(req("/api/subscriptions", "POST", validBody));
    expect(res.status).toBe(201);
    expect(db.create.mock.calls[0][0].data.userId).toBe("user_a");
  });
  it("400 si el body intenta fijar otro userId", async () => {
    const res = await POST(req("/api/subscriptions", "POST", { ...validBody, userId: "user_b" }));
    expect(res.status).toBe(400);
    expect(db.create).not.toHaveBeenCalled();
  });
  it("400 ante cancelUrl javascript: y JSON malformado", async () => {
    expect(
      (await POST(req("/api/subscriptions", "POST", { ...validBody, cancelUrl: "javascript:alert(1)" })))
        .status,
    ).toBe(400);
    expect((await POST(req("/api/subscriptions", "POST", "{not json"))).status).toBe(400);
    expect(db.create).not.toHaveBeenCalled();
  });
});

describe("/api/subscriptions/[id] — aislamiento entre usuarios", () => {
  it("GET: 404 si el recurso es de otro usuario y la consulta filtra por { id, userId }", async () => {
    db.findFirst.mockResolvedValue(null);
    const res = await GET_ONE(req("/api/subscriptions/sub1"), ctx());
    expect(res.status).toBe(404);
    expect(db.findFirst).toHaveBeenCalledWith({ where: { id: "sub1", userId: "user_a" } });
  });
  it("GET: 200 para el dueño", async () => {
    db.findFirst.mockResolvedValue(row());
    expect((await GET_ONE(req("/api/subscriptions/sub1"), ctx())).status).toBe(200);
  });
  it("PATCH: 404 en acceso cruzado (0 filas) y filtra por { id, userId }", async () => {
    db.updateMany.mockResolvedValue({ count: 0 });
    const res = await PATCH(req("/api/subscriptions/sub1", "PATCH", { status: "paused" }), ctx());
    expect(res.status).toBe(404);
    expect(db.updateMany).toHaveBeenCalledWith({
      where: { id: "sub1", userId: "user_a" },
      data: { status: "paused" },
    });
  });
  it("PATCH: 200 para el dueño", async () => {
    db.updateMany.mockResolvedValue({ count: 1 });
    db.findFirst.mockResolvedValue(row({ status: "paused" }));
    const res = await PATCH(req("/api/subscriptions/sub1", "PATCH", { status: "paused" }), ctx());
    expect(res.status).toBe(200);
    expect((await res.json()).status).toBe("paused");
  });
  it("PATCH: 400 con body vacío o userId, sin tocar la BD", async () => {
    expect((await PATCH(req("/api/subscriptions/sub1", "PATCH", {}), ctx())).status).toBe(400);
    expect(
      (await PATCH(req("/api/subscriptions/sub1", "PATCH", { userId: "user_b" }), ctx())).status,
    ).toBe(400);
    expect(db.updateMany).not.toHaveBeenCalled();
  });
  it("DELETE: 404 en acceso cruzado y filtra por { id, userId }", async () => {
    db.deleteMany.mockResolvedValue({ count: 0 });
    const res = await DELETE(req("/api/subscriptions/sub1", "DELETE"), ctx());
    expect(res.status).toBe(404);
    expect(db.deleteMany).toHaveBeenCalledWith({ where: { id: "sub1", userId: "user_a" } });
  });
  it("DELETE: 204 para el dueño", async () => {
    db.deleteMany.mockResolvedValue({ count: 1 });
    expect((await DELETE(req("/api/subscriptions/sub1", "DELETE"), ctx())).status).toBe(204);
  });
});
