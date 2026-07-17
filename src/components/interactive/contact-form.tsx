"use client";

import { FormEvent, useState } from "react";
import { contact } from "@/lib/content";
import { mailtoUrl } from "@/lib/utils";

const initial = {
  name: "",
  email: "",
  telephone: "",
  organization: "",
  focus: "Film",
  message: "",
  consent: false,
  website: "",
};

export function ContactForm() {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !form.name.trim() ||
      !form.email.includes("@") ||
      form.message.trim().length < 12
    ) {
      setError("Please add your name, a valid email, and a short project note.");
      return;
    }

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          telephone: form.telephone,
          organization: form.organization,
          inquiryType: form.focus,
          subject: `${form.focus} enquiry`,
          message: form.message,
          consent: form.consent,
          website: form.website,
        }),
      });

      const result: { ok?: boolean; error?: string } = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "Unable to submit inquiry.");
      }

      setSuccess("Thank you. Your enquiry has been saved.");
      setForm(initial);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? `${submitError.message} You can still send by email below.`
          : "Unable to submit inquiry. You can still send by email below.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="label text-[0.62rem]">Name</span>
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className="mt-2 min-h-12 w-full border border-papyrus/12 bg-papyrus/[0.04] px-4 text-papyrus outline-none transition focus:border-sahel"
            autoComplete="name"
          />
        </label>
        <label className="block">
          <span className="label text-[0.62rem]">Email</span>
          <input
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            className="mt-2 min-h-12 w-full border border-papyrus/12 bg-papyrus/[0.04] px-4 text-papyrus outline-none transition focus:border-sahel"
            autoComplete="email"
            inputMode="email"
          />
        </label>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="label text-[0.62rem]">Telephone</span>
          <input
            value={form.telephone}
            onChange={(event) =>
              setForm({ ...form, telephone: event.target.value })
            }
            className="mt-2 min-h-12 w-full border border-papyrus/12 bg-papyrus/[0.04] px-4 text-papyrus outline-none transition focus:border-sahel"
            autoComplete="tel"
            inputMode="tel"
          />
        </label>
        <label className="block">
          <span className="label text-[0.62rem]">Organization</span>
          <input
            value={form.organization}
            onChange={(event) =>
              setForm({ ...form, organization: event.target.value })
            }
            className="mt-2 min-h-12 w-full border border-papyrus/12 bg-papyrus/[0.04] px-4 text-papyrus outline-none transition focus:border-sahel"
            autoComplete="organization"
          />
        </label>
      </div>
      <label className="block">
        <span className="label text-[0.62rem]">Focus area</span>
        <select
          value={form.focus}
          onChange={(event) => setForm({ ...form, focus: event.target.value })}
          className="mt-2 min-h-12 w-full border border-papyrus/12 bg-obsidian px-4 text-papyrus outline-none transition focus:border-sahel"
        >
          {contact.focusAreas.map((area) => (
            <option key={area}>{area}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="label text-[0.62rem]">Message</span>
        <textarea
          value={form.message}
          onChange={(event) => setForm({ ...form, message: event.target.value })}
          rows={6}
          className="mt-2 w-full resize-y border border-papyrus/12 bg-papyrus/[0.04] px-4 py-3 text-papyrus outline-none transition focus:border-sahel"
        />
      </label>
      <label className="flex gap-3 text-sm leading-6 text-papyrus/68">
        <input
          type="checkbox"
          checked={form.consent}
          onChange={(event) => setForm({ ...form, consent: event.target.checked })}
          className="mt-1 h-4 w-4 accent-sahel"
        />
        <span>
          I agree that Meroestream may use this information to respond to my
          enquiry.
        </span>
      </label>
      <label className="hidden">
        <span>Website</span>
        <input
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(event) => setForm({ ...form, website: event.target.value })}
        />
      </label>
      {error ? (
        <p role="alert" className="border border-crimson/40 bg-crimson/15 p-3 text-sm text-papyrus">
          {error}
        </p>
      ) : null}
      {success ? (
        <p role="status" className="border border-sahel/35 bg-sahel/10 p-3 text-sm text-papyrus">
          {success}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="min-h-12 rounded-full bg-sahel px-6 font-label text-xs font-bold uppercase tracking-[0.2em] text-obsidian transition hover:bg-papyrus"
      >
        {isSubmitting ? "Sending..." : "Send enquiry"}
      </button>
      <a
        href={mailtoUrl({
          to: contact.email,
          name: form.name || "Website visitor",
          email: form.email || "Not provided",
          focus: form.focus,
          message: form.message || "Hello Meroestream,",
        })}
        className="ml-3 inline-flex min-h-12 items-center rounded-full border border-papyrus/15 px-6 font-label text-xs font-bold uppercase tracking-[0.2em] text-papyrus/70 transition hover:border-sahel hover:text-sahel"
      >
        Email instead
      </a>
    </form>
  );
}
