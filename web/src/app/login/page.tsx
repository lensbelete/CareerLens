"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Alert } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("demo@careerlens.dev");
  const [password, setPassword] = useState("DemoPass123!");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to log in");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
      >
        <div>
          <Link href="/" className="text-sm text-stone-500 hover:text-stone-800">
            CareerLens
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">Log in</h1>
          <p className="mt-1 text-sm text-stone-600">
            Demo account is prefilled: demo@careerlens.dev after seeding.
          </p>
        </div>
        {error ? <Alert>{error}</Alert> : null}
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
        <p className="text-sm text-stone-600">
          No account?{" "}
          <Link href="/register" className="font-medium text-teal-800">
            Register
          </Link>
        </p>
      </form>
    </main>
  );
}
