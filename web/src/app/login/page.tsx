"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Wordmark } from "@/components/brand/wordmark";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { notifyError } from "@/lib/notify";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("demo@careerlens.dev");
  const [password, setPassword] = useState("DemoPass123!");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "Unable to log in", "Sign in failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <section className="hidden flex-col justify-between bg-pine px-10 py-10 text-cream lg:flex">
        <Wordmark inverted />
        <blockquote className="max-w-sm">
          <p className="font-serif text-4xl leading-tight">
            Overlap, written down. Not a hiring oracle.
          </p>
          <p className="mt-6 text-sm leading-6 text-cream/60">
            Sign in to compare your profile with the catalogue. The demo account
            is ready after seeding.
          </p>
        </blockquote>
        <p className="text-[11px] uppercase tracking-[0.2em] text-cream/55">
          CareerLens · private to your account
        </p>
      </section>
      <section className="flex items-center justify-center px-4 py-16">
        <form onSubmit={onSubmit} className="w-full max-w-md space-y-5">
          <div className="lg:hidden">
            <Wordmark />
          </div>
          <div>
            <h1 className="font-serif text-4xl">Log in</h1>
            <p className="mt-2 text-sm text-muted">
              Demo after seed: demo@careerlens.dev / DemoPass123!
            </p>
          </div>
          <Field label="Email">
            <Input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-sm text-muted">
            No account?{" "}
            <Link href="/register" className="font-medium text-pine hover:text-ink">
              Register
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
