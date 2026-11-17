import { describe, expect, it } from "vitest";
import { isPrivateApi, isProtectedPage } from "@/lib/route-access";

describe("isProtectedPage", () => {
  it("protege /dashboard y subrutas", () => {
    expect(isProtectedPage("/dashboard")).toBe(true);
    expect(isProtectedPage("/dashboard/settings")).toBe(true);
  });
  it("no protege rutas públicas ni prefijos parecidos", () => {
    expect(isProtectedPage("/")).toBe(false);
    expect(isProtectedPage("/sign-in")).toBe(false);
    expect(isProtectedPage("/dashboards")).toBe(false);
  });
});

describe("isPrivateApi", () => {
  it("considera privados los endpoints /api/*", () => {
    expect(isPrivateApi("/api/subscriptions")).toBe(true);
    expect(isPrivateApi("/api/subscriptions/abc")).toBe(true);
  });
  it("excluye /api/cron/* (usan CRON_SECRET)", () => {
    expect(isPrivateApi("/api/cron/reminders")).toBe(false);
    expect(isPrivateApi("/api/cron/reminders/ack")).toBe(false);
  });
  it("no afecta a rutas que no son API", () => {
    expect(isPrivateApi("/")).toBe(false);
    expect(isPrivateApi("/apix")).toBe(false);
  });
  it("no se deja engañar por prefijos parecidos a cron", () => {
    expect(isPrivateApi("/api/cron-evil")).toBe(true);
  });
});

describe("páginas legales y landing", () => {
  it("son públicas", () => {
    for (const p of ["/", "/privacidad", "/aviso-legal"]) {
      expect(isProtectedPage(p)).toBe(false);
      expect(isPrivateApi(p)).toBe(false);
    }
  });
});
