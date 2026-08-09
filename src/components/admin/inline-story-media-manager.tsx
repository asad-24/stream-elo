"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MediaUploadForm } from "@/components/admin/media-upload-form";
import { YoutubeVideoForm } from "@/components/admin/youtube-video-form";

type Story = { _id: string; title?: string; slug: string; description?: string; status?: string; sortOrder?: number; isActive?: boolean; mediaIds?: string[]; data?: Record<string, unknown> };
type Media = { id: string; title: string; publicUrl?: string; source: string };

export function InlineStoryMediaManager({ story, images, videos, resource = "success-stories", label = "Story" }: { story: Story; images: Media[]; videos: Media[]; resource?: "success-stories" | "bts-projects"; label?: string }) {
  const router = useRouter();
  const data = story.data ?? {};
  const coverId = String(data.coverMediaId ?? story.mediaIds?.[0] ?? "");
  const videoId = String(data.videoMediaId ?? "");
  const cover = images.find((item) => item.id === coverId);
  const video = videos.find((item) => item.id === videoId);
  const [mode, setMode] = useState<"r2" | "youtube">("r2");
  const [message, setMessage] = useState("");

  async function attach(nextCoverId: string, nextVideoId: string) {
    const response = await fetch(`/api/admin/content/${resource}/${story._id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: story.title, slug: story.slug, description: story.description ?? "",
        mediaIds: [nextCoverId, nextVideoId].filter(Boolean),
        data: { ...data, coverMediaId: nextCoverId || null, videoMediaId: nextVideoId || null },
        status: story.status ?? "draft", sortOrder: story.sortOrder ?? 0, isActive: story.isActive !== false,
      }),
    });
    const result = await response.json() as { error?: string };
    if (!response.ok) throw new Error(result.error ?? `Media uploaded, but it could not be attached to the ${label.toLowerCase()}.`);
    router.refresh();
  }

  async function coverUploaded(mediaId: string) { await attach(mediaId, videoId); setMessage(`Cover uploaded and attached to this ${label.toLowerCase()}.`); }
  async function videoUploaded(mediaId: string) { if (!coverId) throw new Error("Upload a cover photo first."); await attach(coverId, mediaId); setMessage("Video uploaded and attached to this story."); }

  return <section className="mt-5 grid gap-5 border border-sahel/25 bg-sahel/[0.035] p-5">
    <div><p className="label">{label} media</p><p className="mt-2 text-sm text-papyrus/55">Upload the cover first. Visitors see the cover and click Play to open the attached video.</p></div>
    <details><summary className="cursor-pointer text-sm text-sahel">Upload or replace cover photo</summary><div className="mt-4"><MediaUploadForm defaultMediaType="image" lockMediaType onUploaded={coverUploaded} /></div></details>
    {cover ? <p className="text-sm text-emerald-200">Current cover: {cover.title}</p> : <p className="text-sm text-amber-200">A cover photo is required before adding video.</p>}
    {coverId ? <details><summary className="cursor-pointer text-sm text-sahel">Upload or replace playable video</summary><div className="mt-4 grid gap-4"><div className="flex gap-2"><button type="button" onClick={() => setMode("r2")} className={`rounded-full border px-4 py-2 text-xs uppercase ${mode === "r2" ? "border-sahel bg-sahel text-obsidian" : "border-papyrus/15"}`}>CDN / R2</button><button type="button" onClick={() => setMode("youtube")} className={`rounded-full border px-4 py-2 text-xs uppercase ${mode === "youtube" ? "border-sahel bg-sahel text-obsidian" : "border-papyrus/15"}`}>YouTube</button></div>{mode === "r2" ? <MediaUploadForm defaultMediaType="video" lockMediaType onUploaded={videoUploaded} /> : <YoutubeVideoForm onCreated={videoUploaded} />}</div></details> : null}
    {video ? <p className="text-sm text-emerald-200">Current video: {video.title} ({video.source})</p> : null}
    {message ? <p className="border border-papyrus/10 p-3 text-sm text-sahel">{message}</p> : null}
  </section>;
}
