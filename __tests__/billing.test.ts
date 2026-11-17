import { describe, expect, it } from "vitest";
import { addCycles, getNextBillingDate, toMonthly, toYearly } from "@/lib/billing";

const d = (s: string) => new Date(s);

describe("toMonthly", () => {
  it("normaliza cada ciclo a mensual", () => {
    expect(toMonthly(10, "monthly")).toBe(10);
    expect(toMonthly(30, "quarterly")).toBe(10);
    expect(toMonthly(120, "yearly")).toBe(10);
    expect(toMonthly(12, "weekly")).toBe(52); // 12*52/12
  });
  it("redondea a 2 decimales", () => {
    expect(toMonthly(10, "quarterly")).toBe(3.33);
    expect(toMonthly(1, "weekly")).toBe(4.33);
  });
});

describe("toYearly", () => {
  it("normaliza cada ciclo a anual", () => {
    expect(toYearly(1, "weekly")).toBe(52);
    expect(toYearly(10, "monthly")).toBe(120);
    expect(toYearly(10, "quarterly")).toBe(40);
    expect(toYearly(99.99, "yearly")).toBe(99.99);
  });
});

describe("addCycles", () => {
  it("suma semanas", () => {
    expect(addCycles(d("2026-01-01T00:00:00Z"), "weekly", 2).toISOString()).toBe(
      "2026-01-15T00:00:00.000Z",
    );
  });
  it("recorta a fin de mes (31 ene + 1 mes)", () => {
    expect(addCycles(d("2026-01-31T00:00:00Z"), "monthly", 1).toISOString()).toBe(
      "2026-02-28T00:00:00.000Z",
    );
    expect(addCycles(d("2028-01-31T00:00:00Z"), "monthly", 1).toISOString()).toBe(
      "2028-02-29T00:00:00.000Z",
    );
  });
  it("no acumula el recorte desde el ancla", () => {
    expect(addCycles(d("2026-01-31T00:00:00Z"), "monthly", 2).toISOString()).toBe(
      "2026-03-31T00:00:00.000Z",
    );
  });
  it("cruza años en trimestral y anual", () => {
    expect(addCycles(d("2026-11-15T00:00:00Z"), "quarterly", 1).toISOString()).toBe(
      "2027-02-15T00:00:00.000Z",
    );
    expect(addCycles(d("2028-02-29T00:00:00Z"), "yearly", 1).toISOString()).toBe(
      "2029-02-28T00:00:00.000Z",
    );
  });
});

describe("getNextBillingDate", () => {
  it("devuelve la misma fecha si es futura", () => {
    const cur = d("2026-12-01T00:00:00Z");
    expect(getNextBillingDate(cur, "monthly", d("2026-11-17T00:00:00Z")).toISOString()).toBe(
      cur.toISOString(),
    );
  });
  it("avanza un ciclo si la fecha ya pasó", () => {
    expect(
      getNextBillingDate(d("2026-11-10T00:00:00Z"), "monthly", d("2026-11-17T00:00:00Z")).toISOString(),
    ).toBe("2026-12-10T00:00:00.000Z");
  });
  it("avanza varios ciclos si lleva tiempo vencida", () => {
    expect(
      getNextBillingDate(d("2026-01-01T00:00:00Z"), "weekly", d("2026-01-20T00:00:00Z")).toISOString(),
    ).toBe("2026-01-22T00:00:00.000Z");
  });
  it("si coincide exactamente con `from`, pasa al siguiente ciclo", () => {
    expect(
      getNextBillingDate(d("2026-11-17T00:00:00Z"), "yearly", d("2026-11-17T00:00:00Z")).toISOString(),
    ).toBe("2027-11-17T00:00:00.000Z");
  });
  it("mantiene el día ancla tras un mes corto", () => {
    expect(
      getNextBillingDate(d("2026-01-31T00:00:00Z"), "monthly", d("2026-03-01T00:00:00Z")).toISOString(),
    ).toBe("2026-03-31T00:00:00.000Z");
  });
  it("no muta la fecha de entrada", () => {
    const cur = d("2026-01-01T00:00:00Z");
    getNextBillingDate(cur, "monthly", d("2026-06-01T00:00:00Z"));
    expect(cur.toISOString()).toBe("2026-01-01T00:00:00.000Z");
  });
});
