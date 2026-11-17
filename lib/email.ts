export type OutgoingEmail = { to: string; subject: string; html: string; text: string };

const BATCH_SIZE = 100;

/**
 * Envía emails con Resend (endpoint batch, máx. 100 por llamada).
 * Devuelve, por cada email de entrada, si su lote se envió correctamente.
 */
export async function sendEmails(emails: OutgoingEmail[]): Promise<boolean[]> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) throw new Error("RESEND_API_KEY y EMAIL_FROM son obligatorias");

  const results: boolean[] = [];
  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const chunk = emails.slice(i, i + BATCH_SIZE);
    let ok = false;
    try {
      const res = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(
          chunk.map((e) => ({ from, to: [e.to], subject: e.subject, html: e.html, text: e.text })),
        ),
      });
      ok = res.ok;
    } catch {
      ok = false;
    }
    results.push(...chunk.map(() => ok));
  }
  return results;
}
