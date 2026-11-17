import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { BrandLogo } from "@/components/brand-logo";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <Link href="/dashboard" aria-label="SubTracker, inicio del dashboard">
            <BrandLogo />
          </Link>
          <UserButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
