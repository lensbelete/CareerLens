"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/brand/wordmark";
import { useAuth } from "@/lib/auth-context";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/jobs", label: "Catalogue" },
  { href: "/saved", label: "Saved" },
  { href: "/applications", label: "Pipeline" },
  { href: "/gaps", label: "Gaps" },
  { href: "/resumes", label: "CVs" },
  { href: "/profile", label: "Profile" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, ready, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        Preparing your workspace…
      </div>
    );
  }

  return (
    <div className="min-h-screen text-ink">
      <div className="flex items-center justify-between border-b border-line bg-cream/80 px-4 py-3 backdrop-blur lg:hidden">
        <Wordmark href="/dashboard" />
        <button
          type="button"
          className="rounded-sm border border-line px-3 py-1 text-xs uppercase tracking-[0.16em]"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      <div className="lg:grid lg:grid-cols-[248px_1fr]">
        <aside
          className={`${open ? "block" : "hidden"} border-b border-ink/20 bg-pine text-cream lg:flex lg:min-h-screen lg:flex-col lg:border-b-0`}
        >
          <div className="hidden px-5 py-7 lg:block">
            <Wordmark href="/dashboard" inverted />
            <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-cream/50">
              Matching, with receipts
            </p>
          </div>
          <nav className="flex flex-col gap-0.5 px-3 pb-4">
            {NAV.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-sm px-3 py-2 text-sm ${
                    active
                      ? "bg-cream/10 text-cream"
                      : "text-cream/65 hover:bg-cream/5 hover:text-cream"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-cream/10 p-5 lg:mt-auto">
            <p className="truncate text-sm text-cream">{user.fullName}</p>
            <p className="truncate text-xs text-cream/50">{user.email}</p>
            <button
              type="button"
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              className="mt-4 text-[11px] uppercase tracking-[0.18em] text-brass hover:text-cream"
            >
              Log out
            </button>
          </div>
        </aside>
        <main className="px-4 py-8 sm:px-10 lg:px-12">{children}</main>
      </div>
    </div>
  );
}
