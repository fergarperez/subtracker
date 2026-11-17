import type { Metadata } from "next";
import { contactEmail, legalUpdated } from "@/lib/legal";

export const metadata: Metadata = { title: "Privacidad · SubTracker" };

export default function PrivacyPage() {
  return (
    <article>
      <h1>Política de privacidad</h1>
      <p>Última actualización: {legalUpdated}.</p>

      <h2>Qué datos guardamos</h2>
      <ul>
        <li>Tu cuenta (identificador y correo electrónico), gestionada con Clerk.</li>
        <li>
          Las suscripciones que apuntas: nombre, precio, divisa, ciclo, fecha de cobro, días de
          aviso, categoría, estado, enlace de cancelación y notas.
        </li>
      </ul>
      <p>No guardamos datos de pago ni nos conectamos a tu banco.</p>

      <h2>Para qué los usamos</h2>
      <ul>
        <li>Mostrarte tu gasto y tus próximos cobros.</li>
        <li>Enviarte un email antes de cada cobro. No usamos tus datos para publicidad.</li>
      </ul>

      <h2>Con quién los compartimos</h2>
      <p>Solo con los proveedores necesarios para que el servicio funcione:</p>
      <ul>
        <li>Clerk: registro e inicio de sesión.</li>
        <li>Neon: base de datos donde se guardan tus suscripciones.</li>
        <li>Resend: envío de los emails de aviso.</li>
        <li>Vercel: alojamiento de la aplicación y ejecución diaria de los avisos.</li>
      </ul>

      <h2>Cómo borrar tus datos</h2>
      <p>
        Puedes eliminar cualquier suscripción desde el dashboard en cualquier momento. Para
        eliminar tu cuenta y todos tus datos, o para acceder a ellos, rectificarlos u oponerte a su
        tratamiento,{" "}
        {contactEmail ? (
          <>
            escribe a{" "}
            <a className="text-primary underline" href={`mailto:${contactEmail}`}>
              {contactEmail}
            </a>
            .
          </>
        ) : (
          "contacta con el responsable del servicio."
        )}
      </p>
    </article>
  );
}
