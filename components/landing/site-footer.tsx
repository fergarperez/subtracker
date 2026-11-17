import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

const link = "text-muted-foreground transition-colors hover:text-foreground";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-[1.5fr_1fr_1fr]">
        <div className="flex flex-col gap-2">
          <BrandLogo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Que ningún cobro te pille por sorpresa.
          </p>
        </div>
        <nav aria-label="Navegación" className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Producto</span>
          <Link href="/#vista-previa" className={link}>Cómo funciona</Link>
          <Link href="/sign-up" className={link}>Empezar gratis</Link>
          <Link href="/sign-in" className={link}>Iniciar sesión</Link>
        </nav>
        <nav aria-label="Legal" className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Legal</span>
          <Link href="/privacidad" className={link}>Privacidad</Link>
          <Link href="/aviso-legal" className={link}>Aviso legal y cookies</Link>
        </nav>
      </div>
      <p className="border-t border-border py-4 text-center text-sm text-muted-foreground">
        Hecho por Fernando
      </p>
    </footer>
  );
}
