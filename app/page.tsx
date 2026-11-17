import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { BellRing, Calculator, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ProductPreview } from "@/components/landing/product-preview";

async function RedirectIfSignedIn() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");
  return null;
}

const features = [
  {
    icon: Calculator,
    title: "Cálculo real mensual y anual",
    text: "Suma semanales, mensuales, trimestrales y anuales en una sola cifra para saber cuánto gastas de verdad.",
  },
  {
    icon: BellRing,
    title: "Avisos antes de cada cobro",
    text: "Te escribimos por email con antelación para que decidas si mantienes o cancelas el servicio.",
  },
  {
    icon: ShieldCheck,
    title: "Gratis y privada",
    text: "Sin coste y con tus datos solo para ti: nadie más puede ver tus suscripciones.",
  },
];

export default function Home() {
  return (
    <>
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>

      <header className="border-b border-border">
        <nav className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
          <span className="font-semibold tracking-tight">SubTracker</span>
          <div className="flex items-center gap-2">
            <Link href="/sign-in" className={buttonVariants({ variant: "ghost" })}>
              Iniciar sesión
            </Link>
            <Link href="/sign-up" className={buttonVariants()}>
              Empezar gratis
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4">
        <section className="flex flex-col items-center gap-6 py-16 text-center sm:py-24">
          <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            Gratis para siempre
          </span>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Controla tus suscripciones antes de que te las cobren.
          </h1>
          <p className="max-w-xl text-muted-foreground">
            Calcula cuánto gastas al mes y al año en todas tus suscripciones y recibe un aviso por
            email antes de cada cobro.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/sign-up" className={buttonVariants({ size: "lg" })}>
              Empezar gratis
            </Link>
            <a href="#vista-previa" className={buttonVariants({ variant: "secondary", size: "lg" })}>
              Ver cómo funciona
            </a>
          </div>
        </section>

        <ProductPreview />

        <section className="grid gap-4 py-16 md:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-5">
              <Icon className="size-5 text-primary" aria-hidden />
              <h2 className="mt-3 font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
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
