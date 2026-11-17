import type { Metadata } from "next";
import { contactEmail, legalUpdated } from "@/lib/legal";

export const metadata: Metadata = { title: "Aviso legal y cookies · SubTracker" };

export default function LegalNoticePage() {
  return (
    <article>
      <h1>Aviso legal y cookies</h1>
      <p>Última actualización: {legalUpdated}.</p>

      <h2>Quién es el responsable</h2>
      <p>
        SubTracker es un servicio gratuito para controlar suscripciones, creado y mantenido por
        Fernando.{" "}
        {contactEmail && (
          <>
            Contacto:{" "}
            <a className="text-primary underline" href={`mailto:${contactEmail}`}>
              {contactEmail}
            </a>
            .
          </>
        )}
      </p>

      <h2>Condiciones de uso</h2>
      <p>
        El servicio se ofrece tal cual, sin garantías. Las fechas y los importes los introduces tú:
        comprueba siempre tus cobros reales y no dependas solo de los avisos.
      </p>

      <h2>Cookies</h2>
      <p>
        Solo usamos cookies técnicas necesarias para mantener tu sesión (Clerk). No usamos cookies
        de publicidad ni de seguimiento, por lo que no necesitas aceptar nada para navegar.
      </p>
    </article>
  );
}
