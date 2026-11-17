import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";

async function RedirectIfSignedIn() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");
  return null;
}

// Landing mínima: el diseño completo llega en la Fase 3.5.
export default function Home() {
  return (
    <>
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
        <h1 className="max-w-xl text-4xl font-semibold tracking-tight">
          Controla tus suscripciones antes de que te las cobren.
        </h1>
        <div className="flex gap-3">
          <Link href="/sign-up" className={buttonVariants()}>
            Empezar gratis
          </Link>
          <Link href="/sign-in" className={buttonVariants({ variant: "secondary" })}>
            Iniciar sesión
          </Link>
        </div>
      </main>
    </>
  );
}
