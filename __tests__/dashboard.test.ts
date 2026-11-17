import { describe, expect, it } from "vitest";
import {
  categoryBreakdown,
  computeTotals,
  hueFromText,
  markerRows,
  timelinePosition,
  filterByStatus,
  formatCountdown,
  getUrgency,
  nextCharge,
  sortSubscriptions,
  upcomingCharges,
  type Subscription,
} from "@/lib/dashboard";

const now = new Date("2026-11-17T12:00:00Z");
const inHours = (h: number) => new Date(now.getTime() + h * 3600_000).toISOString();

const sub = (over: Partial<Subscription> = {}): Subscription => ({
  id: "1",
  name: "Netflix",
  price: 12,
  currency: "EUR",
  billingCycle: "monthly",
  nextBillingDate: inHours(100),
  reminderDays: 3,
  category: "General",
  status: "active",
  cancelUrl: null,
  notes: null,
  createdAt: now.toISOString(),
  updatedAt: now.toISOString(),
  ...over,
});

describe("computeTotals", () => {
  it("normaliza ciclos y solo cuenta activas", () => {
    const totals = computeTotals([
      sub({ price: 10, billingCycle: "monthly" }),
      sub({ price: 120, billingCycle: "yearly" }),
      sub({ price: 50, status: "paused" }),
    ]);
    expect(totals).toEqual([{ currency: "EUR", monthly: 20, yearly: 240 }]);
  });

  it("separa por divisa", () => {
    const totals = computeTotals([sub({ price: 10 }), sub({ price: 5, currency: "USD" })]);
    expect(totals.map((t) => t.currency)).toEqual(["EUR", "USD"]);
  });

  it("devuelve vacío sin suscripciones activas", () => {
    expect(computeTotals([])).toEqual([]);
  });
});

describe("upcomingCharges / nextCharge", () => {
  const list = [
    sub({ id: "a", nextBillingDate: inHours(24 * 20) }),
    sub({ id: "b", nextBillingDate: inHours(24 * 3) }),
    sub({ id: "c", nextBillingDate: inHours(-5) }),
    sub({ id: "d", nextBillingDate: inHours(24), status: "paused" }),
  ];

  it("filtra por ventana, excluye pasadas e inactivas y ordena", () => {
    expect(upcomingCharges(list, now, 30).map((s) => s.id)).toEqual(["b", "a"]);
    expect(upcomingCharges(list, now, 7).map((s) => s.id)).toEqual(["b"]);
  });

  it("nextCharge devuelve la más cercana o null", () => {
    expect(nextCharge(list, now)?.id).toBe("b");
    expect(nextCharge([], now)).toBeNull();
  });
});

describe("getUrgency", () => {
  it("clasifica según la distancia al cobro", () => {
    expect(getUrgency(sub({ nextBillingDate: inHours(24) }), now)).toBe("urgent");
    expect(getUrgency(sub({ nextBillingDate: inHours(24 * 5) }), now)).toBe("warning");
    expect(getUrgency(sub({ nextBillingDate: inHours(24 * 10) }), now)).toBe("safe");
    expect(getUrgency(sub({ status: "paused" }), now)).toBe("inactive");
  });
});

describe("formatCountdown", () => {
  it("formatea en español", () => {
    expect(formatCountdown(inHours(-1), now)).toBe("Vencido");
    expect(formatCountdown(inHours(0.5), now)).toBe("En menos de 1 h");
    expect(formatCountdown(inHours(5), now)).toBe("En 5 h");
    expect(formatCountdown(inHours(30), now)).toBe("Mañana");
    expect(formatCountdown(inHours(24 * 4 + 2), now)).toBe("En 4 días");
  });
});

describe("filterByStatus / sortSubscriptions", () => {
  const list = [
    sub({ id: "a", price: 5, nextBillingDate: inHours(50) }),
    sub({ id: "b", price: 50, nextBillingDate: inHours(10), status: "paused" }),
    sub({ id: "c", price: 100, billingCycle: "yearly", nextBillingDate: inHours(30) }),
  ];

  it("filtra por estado", () => {
    expect(filterByStatus(list, "active").map((s) => s.id)).toEqual(["a", "c"]);
    expect(filterByStatus(list, "paused").map((s) => s.id)).toEqual(["b"]);
    expect(filterByStatus(list, "all")).toHaveLength(3);
  });

  it("ordena por fecha e importe mensual sin mutar", () => {
    expect(sortSubscriptions(list, "date").map((s) => s.id)).toEqual(["b", "c", "a"]);
    expect(sortSubscriptions(list, "amount").map((s) => s.id)).toEqual(["b", "c", "a"]);
    expect(list.map((s) => s.id)).toEqual(["a", "b", "c"]);
  });
});

describe("categoryBreakdown", () => {
  it("agrupa por categoría en mensual, solo activas y de la divisa", () => {
    const r = categoryBreakdown(
      [
        sub({ id: "1", category: "Vídeo", price: 10 }),
        sub({ id: "2", category: "Vídeo", price: 120, billingCycle: "yearly" }),
        sub({ id: "3", category: "Música", price: 30 }),
        sub({ id: "4", category: "Música", price: 99, status: "paused" }),
        sub({ id: "5", category: "Otra", price: 50, currency: "USD" }),
      ],
      "EUR",
    );
    expect(r.map((c) => c.category)).toEqual(["Música", "Vídeo"]);
    expect(r[1].monthly).toBe(20);
    expect(r[0].share).toBeCloseTo(0.6);
  });
  it("vacío sin gasto", () => {
    expect(categoryBreakdown([], "EUR")).toEqual([]);
  });
});

describe("timelinePosition / hueFromText", () => {
  it("normaliza y acota a 0–1", () => {
    expect(timelinePosition(inHours(24 * 15), now, 30)).toBeCloseTo(0.5);
    expect(timelinePosition(inHours(-5), now, 30)).toBe(0);
    expect(timelinePosition(inHours(24 * 90), now, 30)).toBe(1);
  });
  it("el tono es estable y está en rango", () => {
    expect(hueFromText("Netflix")).toBe(hueFromText("netflix"));
    expect(hueFromText("x")).toBeGreaterThanOrEqual(0);
    expect(hueFromText("Spotify")).toBeLessThan(360);
  });
});

describe("markerRows", () => {
  it("alterna fila solo cuando los marcadores están muy juntos", () => {
    expect(markerRows([0.1, 0.12, 0.14, 0.5])).toEqual([0, 1, 0, 0]);
    expect(markerRows([])).toEqual([]);
  });
});
