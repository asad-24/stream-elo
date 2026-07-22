"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const messages: Record<string, string> = {
  limited: "Too many attempts. Try again shortly.",
  "database-config": "MongoDB env variables are missing.",
  "database-unavailable": "MongoDB is not connecting right now.",
  "session-secret": "SESSION_SECRET is missing in .env.local.",
  unavailable: "Admin login is unavailable right now.",
  invalid: "Email or password is incorrect.",
};

export function LoginForm({ initialError }: { initialError?: string }) {
  const router = useRouter();
  const [message, setMessage] = useState(initialError ? messages[initialError] : "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    const result = (await response.json()) as {
      ok: boolean;
      redirectTo?: string;
      error?: string;
      message?: string;
    };

    setIsSubmitting(false);

    if (result.ok && result.redirectTo) {
      router.push(result.redirectTo);
      router.refresh();
      return;
    }

    setMessage(result.message || messages[result.error ?? ""] || messages.unavailable);
  }

  return (
    <>
      {message ? (
        <p className="mt-5 border border-crimson/30 bg-crimson/10 p-3 text-sm text-papyrus">
          {message}
        </p>
      ) : null}
      <form onSubmit={onSubmit} className="mt-7 space-y-5">
        <label className="block">
          <span className="font-label text-xs uppercase tracking-[0.18em] text-papyrus/60">
            Email
          </span>
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            className="mt-2 min-h-12 w-full border border-papyrus/12 bg-obsidian px-4 text-papyrus"
          />
        </label>
        <label className="block">
          <span className="font-label text-xs uppercase tracking-[0.18em] text-papyrus/60">
            Password
          </span>
          <input
            required
            type="password"
            name="password"
            autoComplete="current-password"
            className="mt-2 min-h-12 w-full border border-papyrus/12 bg-obsidian px-4 text-papyrus"
          />
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-12 w-full rounded-full bg-sahel px-5 font-label text-xs font-bold uppercase tracking-[0.18em] text-obsidian transition hover:bg-papyrus disabled:cursor-wait disabled:opacity-70"
        >
          {isSubmitting ? "Signing in" : "Sign in"}
        </button>
      </form>
    </>
  );
}
