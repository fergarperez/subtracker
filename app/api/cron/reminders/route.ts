import { NextResponse, type NextRequest } from "next/server";
import { isValidCronAuth } from "@/lib/cron-auth";
import { sendEmails } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { buildReminderEmail, planReminders, type ReminderSubscription } from "@/lib/reminders";
import type { BillingCycle } from "@/lib/billing";

export async function GET(req: NextRequest) {
  if (!isValidCronAuth(req.headers.get("authorization"), process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const rows = await prisma.subscription.findMany({ where: { status: "active" } });
  const subs: ReminderSubscription[] = rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    name: r.name,
    price: Number(r.price.toString()),
    currency: r.currency,
    billingCycle: r.billingCycle as BillingCycle,
    nextBillingDate: r.nextBillingDate,
    reminderDays: r.reminderDays,
    lastNotifiedFor: r.lastNotifiedFor,
    status: r.status,
    cancelUrl: r.cancelUrl,
  }));

  const { rollovers, byUser } = planReminders(subs, now);

  // 1) Rollover primero: si el email falla, el siguiente run reintenta el aviso.
  for (const r of rollovers) {
    await prisma.subscription.update({
      where: { id: r.id },
      data: { nextBillingDate: r.nextBillingDate },
    });
  }

  // 2) Usuarios con email (los demás se omiten).
  const userIds = [...byUser.keys()];
  const settings = userIds.length
    ? await prisma.userSettings.findMany({ where: { userId: { in: userIds } } })
    : [];
  const emailByUser = new Map<string, string>();
  for (const s of settings) if (s.email) emailByUser.set(s.userId, s.email);

  const targets = userIds.filter((u) => emailByUser.has(u));
  const skippedNoEmail = userIds.length - targets.length;

  const results = targets.length
    ? await sendEmails(
        targets.map((u) => ({
          to: emailByUser.get(u)!,
          ...buildReminderEmail(byUser.get(u)!),
        })),
      )
    : [];

  // 3) Marcar notificadas solo tras envío correcto.
  let sent = 0;
  let failed = 0;
  let notifiedSubscriptions = 0;
  for (const [i, u] of targets.entries()) {
    if (!results[i]) {
      failed += 1;
      continue;
    }
    sent += 1;
    for (const item of byUser.get(u)!) {
      await prisma.subscription.update({
        where: { id: item.id },
        data: { lastNotifiedFor: item.billingDate },
      });
      notifiedSubscriptions += 1;
    }
  }

  return NextResponse.json({
    rolledOver: rollovers.length,
    emailsSent: sent,
    emailsFailed: failed,
    subscriptionsNotified: notifiedSubscriptions,
    skippedNoEmail,
  });
}
