import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { BellRing, Calculator, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { buttonVariants } from "@/components/ui/button";
import { ProductPreview } from "@/components/landing/product-preview";

async function NavActions() {
  const { userId } = await auth();
  if (userId) {
    return (
      <Link href="/dashboard" className={buttonVariants()}>
        Ir al dashboard
      </Link>
    );
  }
  return (
    <>
      <Link href="/sign-in" className={buttonVariants({ variant: "ghost" })}>
        Iniciar sesión
      </Link>
      <Link href="/sign-up" className={buttonVariants()}>
        Empezar gratis
      </Link>
    </>
  );
}

const features = [
  {
    icon: Calculator,
    title: "Cuánto gastas de verdad",
    text: "Mezcla pagos semanales, mensuales y anuales y te dice cuánto son al mes y al año.",
  },
  {
    icon: BellRing,
    title: "Un aviso antes de cada cobro",
    text: "Te escribimos por email los días que elijas, para que cancelles a tiempo si ya no lo usas.",
  },
  {
    icon: ShieldCheck,
    title: "Gratis y solo tuya",
    text: "No cuesta nada y nadie más puede ver tus suscripciones.",
  },
];

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <BrandLogo />
          <div className="flex h-9 items-center gap-2">
            {/* Cache Components: auth() lee la sesión en runtime, por eso va tras Suspense. */}
            <Suspense fallback={null}>
              <NavActions />
            </Suspense>
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4">
        <section className="grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1fr_1.1fr]">
          <div className="flex flex-col items-start gap-6">
            <span className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">
              Gratis para siempre
            </span>
            <h1 className="max-w-xl font-display text-4xl leading-[1.05] font-semibold tracking-tight sm:text-6xl">
              Que ningún cobro te pille por sorpresa.
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              Apunta tus suscripciones, mira cuánto gastas al mes y al año, y recibe un email antes
              de cada cobro.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/sign-up" className={buttonVariants({ size: "lg" })}>
                Empezar gratis
              </Link>
              <a href="#vista-previa" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                Ver cómo funciona
              </a>
            </div>
          </div>
          <ProductPreview />
        </section>

        <section className="grid gap-8 border-t border-border py-14 md:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title}>
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Icon className="size-5" aria-hidden />
              </span>
              <h2 className="mt-4 font-display text-lg font-semibold tracking-tight">{title}</h2>
              <p className="mt-1 max-w-xs text-muted-foreground">{text}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        Hecho por Fernando
      </footer>
    </>
  );
}
