// Cliente `fetch` tipado hacia /api/subscriptions (toda mutación pasa por Route Handlers).
import type { Subscription } from "@/lib/dashboard";

export const SUBSCRIPTIONS_KEY = "/api/subscriptions";

/** Cuerpo de creación/edición; coincide con los schemas Zod del servidor. */
export type SubscriptionPayload = {
  name: string;
  price: number;
  currency: string;
  billingCycle: Subscription["billingCycle"];
  nextBillingDate: string;
  reminderDays: number;
  category: string;
  status: Subscription["status"];
  cancelUrl: string | null;
  notes: string | null;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
  });
  if (!res.ok) {
    throw new ApiError(
      res.status === 400 ? "Revisa los datos del formulario." : "Ha ocurrido un error.",
      res.status,
    );
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

export const fetchSubscriptions = (url: string) => request<Subscription[]>(url);

export const createSubscription = (data: SubscriptionPayload) =>
  request<Subscription>(SUBSCRIPTIONS_KEY, { method: "POST", body: JSON.stringify(data) });

export const updateSubscription = (id: string, data: Partial<SubscriptionPayload>) =>
  request<Subscription>(`${SUBSCRIPTIONS_KEY}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteSubscription = (id: string) =>
  request<void>(`${SUBSCRIPTIONS_KEY}/${encodeURIComponent(id)}`, { method: "DELETE" });
