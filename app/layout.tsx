import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import { dark } from "@clerk/ui/themes";
import { Suspense } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SubTracker",
  description:
    "Controla tus suscripciones antes de que te las cobren: gasto mensual y anual, y avisos por email.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Cache Components: ClerkProvider lee la ruta en runtime, por eso va tras Suspense. */}
        <Suspense fallback={null}>
          <ClerkProvider
            appearance={{ theme: dark, variables: { colorPrimary: "#10B981" } }}
            localization={esES}
          >
            {children}
          </ClerkProvider>
        </Suspense>
      </body>
    </html>
  );
}
