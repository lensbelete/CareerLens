"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Wordmark } from "@/components/brand/wordmark";
import { Alert } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setPending(true);
    try {
      await register({ fullName, email, password });
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to register");
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
            A private ledger for the search.
          </p>
          <p className="mt-6 text-sm leading-6 text-cream/60">
            CVs, notes, and applications stay on your account. Nothing here is
            shared with employers.
          </p>
        </blockquote>
        <p className="text-[11px] uppercase tracking-[0.2em] text-brass">
          CareerLens · structured, editable, yours
        </p>
      </section>
      <section className="flex items-center justify-center px-4 py-16">
        <form onSubmit={onSubmit} className="w-full max-w-md space-y-5">
          <div className="lg:hidden">
            <Wordmark />
          </div>
          <div>
            <h1 className="font-serif text-4xl">Create an account</h1>
            <p className="mt-2 text-sm text-muted">
              Password at least 8 characters. We hash it; we never store it in
              plaintext.
            </p>
          </div>
          {error ? <Alert>{error}</Alert> : null}
          <Field label="Full name">
            <Input
              required
              minLength={2}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </Field>
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
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Creating…" : "Create account"}
          </Button>
          <p className="text-sm text-muted">
            Already registered?{" "}
            <Link href="/login" className="font-medium text-brass hover:text-ink">
              Log in
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
