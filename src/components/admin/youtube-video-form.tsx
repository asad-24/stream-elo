"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function YoutubeVideoForm({ onCreated }: { onCreated?: (mediaId: string) => void | Promise<void> } = {}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setMessage(""); setError(false);
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const response = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "youtube", url: data.get("url"), title: data.get("title"), caption: data.get("caption") }),
      });
      const result = await response.json() as { ok?: boolean; error?: string; data?: { _id?: string } };
      if (!response.ok || !result.ok) throw new Error(result.error || "Unable to save video.");

      if (result.data?._id) await onCreated?.(result.data._id);
      form.reset();
      setMessage("YouTube video was saved directly to MongoDB.");
      router.refresh();
    } catch (caught) {
      setError(true);
      setMessage(caught instanceof Error ? caught.message : "Unable to save video.");
    } finally { setSaving(false); }
  }

  const field = "min-h-12 border border-papyrus/15 bg-obsidian px-4 text-papyrus";
  return <form onSubmit={submit} className="grid gap-5">
    <label className="grid gap-2"><span className="label">YouTube link</span><input required name="url" type="url" placeholder="https://www.youtube.com/watch?v=..." className={field} /></label>
    <label className="grid gap-2"><span className="label">Display title</span><input required name="title" maxLength={180} placeholder="Video title" className={field} /></label>
    <label className="grid gap-2"><span className="label">Caption / display details</span><textarea name="caption" maxLength={500} rows={3} className="border border-papyrus/15 bg-obsidian p-4 text-papyrus" /></label>
    <button type="submit" disabled={saving} className="inline-flex min-h-12 w-fit items-center gap-2 rounded-full bg-sahel px-5 font-label text-xs font-bold uppercase tracking-[0.18em] text-obsidian disabled:opacity-55">{saving ? "Saving" : "Add YouTube video"}</button>
    {message ? <p className={`border p-4 text-sm ${error ? "border-red-400/30 bg-red-500/10 text-red-100" : "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"}`}>{message}</p> : null}
  </form>;
}
