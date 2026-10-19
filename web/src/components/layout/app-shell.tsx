"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/jobs", label: "Jobs" },
  { href: "/saved", label: "Saved jobs" },
  { href: "/applications", label: "Applications" },
  { href: "/gaps", label: "Skill gaps" },
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
      <div className="flex min-h-screen items-center justify-center text-sm text-stone-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-950">
      <div className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 lg:hidden">
        <Link href="/dashboard" className="font-semibold tracking-tight">
          CareerLens
        </Link>
        <button
          type="button"
          className="rounded-md px-3 py-1 text-sm hover:bg-stone-100"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      <div className="lg:grid lg:grid-cols-[240px_1fr]">
        <aside
          className={`${open ? "block" : "hidden"} border-b border-stone-200 bg-white lg:flex lg:min-h-screen lg:flex-col lg:border-b-0 lg:border-r`}
        >
          <div className="hidden px-5 py-5 lg:block">
            <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
              CareerLens
            </Link>
            <p className="mt-1 text-xs text-stone-500">Job matching, explained</p>
          </div>
          <nav className="flex flex-col gap-0.5 p-3">
            {NAV.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-md px-3 py-2 text-sm ${
                    active
                      ? "bg-teal-800 text-white"
                      : "text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-stone-200 p-4 lg:mt-auto">
            <p className="truncate text-sm font-medium">{user.fullName}</p>
            <p className="truncate text-xs text-stone-500">{user.email}</p>
            <button
              type="button"
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              className="mt-3 text-sm text-stone-600 hover:text-stone-950"
            >
              Log out
            </button>
          </div>
        </aside>
        <main className="px-4 py-6 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
