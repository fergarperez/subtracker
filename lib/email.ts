import { Resend } from "resend";

export type OutgoingEmail = { to: string; subject: string; html: string; text: string };

const BATCH_SIZE = 100;

/**
 * Envía emails con el SDK de Resend (batch, máx. 100 por llamada).
 * Devuelve, por cada email de entrada, si su lote se envió correctamente.
 */
export async function sendEmails(emails: OutgoingEmail[]): Promise<boolean[]> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) throw new Error("RESEND_API_KEY y EMAIL_FROM son obligatorias");

  const resend = new Resend(apiKey);
  const results: boolean[] = [];
  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const chunk = emails.slice(i, i + BATCH_SIZE);
    let ok = false;
    try {
      const { error } = await resend.batch.send(
        chunk.map((e) => ({ from, to: [e.to], subject: e.subject, html: e.html, text: e.text })),
      );
      ok = !error;
      if (error) {
        // Solo nombre y mensaje de Resend (sin destinatarios) para poder diagnosticar en los logs.
        console.error("Resend batch failed", error.name, error.message);
      }
    } catch (err) {
      console.error("Resend batch request error", err instanceof Error ? err.message : "desconocido");
    }
    results.push(...chunk.map(() => ok));
  }
  return results;
}
