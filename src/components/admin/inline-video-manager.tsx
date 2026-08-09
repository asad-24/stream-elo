"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MediaUploadForm } from "@/components/admin/media-upload-form";

type Video = { id: string; title: string; publicUrl: string; source: string };
type HeroSection = { id: string; page: string; section: string; sectionType: string; heading: string; subheading: string; body: string; status: string; sortOrder: number; isActive: boolean; mediaIds: string[]; data: Record<string, unknown> };

export function InlineVideoManager({ videos, section }: { videos: Video[]; section: HeroSection }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");

  async function savePlaylist(mediaIds: string[]) {
    const response = await fetch(`/api/admin/content/page-sections/${section.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: section.page, section: section.section, sectionType: section.sectionType, heading: section.heading, subheading: section.subheading, body: section.body, mediaIds, data: section.data, status: section.status, sortOrder: section.sortOrder, isActive: section.isActive }),
    });
    const result = await response.json() as { error?: string };
    if (!response.ok) throw new Error(result.error ?? "Unable to update the Hero playlist.");
  }

  async function addToPlaylist(mediaId: string) {
    await savePlaylist([...section.mediaIds.filter((id) => id !== mediaId), mediaId]);
    setMessage("Video uploaded and added to the Hero playlist.");
    router.refresh();
  }

  async function remove(video: Video) {
    if (!window.confirm(`Delete “${video.title}” from the Hero playlist and R2?`)) return;
    setBusyId(video.id); setMessage("");
    try {
      await savePlaylist(section.mediaIds.filter((id) => id !== video.id));
      const response = await fetch(`/api/admin/media/${video.id}`, { method: "DELETE" });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to delete video.");
      setMessage("Video deleted from the Hero playlist and R2.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete video.");
    } finally { setBusyId(""); }
  }

  return <section className="grid gap-5 border border-sahel/25 bg-sahel/[0.035] p-5">
    <div><p className="label">Hero video playlist</p><h3 className="mt-2 font-serif text-2xl text-papyrus">Upload background videos</h3><p className="mt-2 text-sm text-papyrus/55">One video loops continuously. Multiple videos play in this order and restart after the last video.</p></div>
    <div className="border-t border-papyrus/10 pt-5"><MediaUploadForm defaultMediaType="video" lockMediaType onUploaded={addToPlaylist} /></div>
    <div className="border-t border-papyrus/10 pt-5"><p className="label mb-3">Videos in the Hero loop</p>{videos.length ? <div className="grid gap-3">{videos.map((video, index) => <div key={video.id} className="flex flex-wrap items-center justify-between gap-3 border border-papyrus/10 p-4"><div><p className="text-papyrus"><span className="mr-3 text-sahel">{index + 1}</span>{video.title}</p><p className="mt-1 text-xs uppercase text-papyrus/40">R2 / CDN</p></div><div className="flex gap-3"><a href={video.publicUrl} target="_blank" rel="noreferrer" className="text-xs text-sahel hover:underline">Preview</a><button type="button" disabled={busyId === video.id} onClick={() => remove(video)} className="text-xs uppercase text-red-200 hover:underline">Delete</button></div></div>)}</div> : <p className="text-sm text-papyrus/50">No Hero videos yet. Upload the first video above.</p>}</div>
    {message ? <p className="border border-papyrus/10 p-3 text-sm text-sahel">{message}</p> : null}
  </section>;
}
