"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { InlineStoryMediaManager } from "@/components/admin/inline-story-media-manager";
import { MediaUploadForm } from "@/components/admin/media-upload-form";
import { YoutubeVideoForm } from "@/components/admin/youtube-video-form";

type Media = { id: string; title: string; publicUrl?: string; source: string };
type BtsProject = { _id: string; title?: string; slug: string; description?: string; status?: string; sortOrder?: number; isActive?: boolean; mediaIds?: string[]; data?: Record<string, unknown> };

function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `bts-${Date.now()}`; }
const field = "min-h-11 border border-papyrus/15 bg-obsidian px-4 text-papyrus";

function Fields({ project }: { project?: BtsProject }) {
  return <>
    <label className="grid gap-2"><span className="label">Project title</span><input required name="title" defaultValue={project?.title ?? ""} placeholder="The Iron River" className={field} /></label>
    <label className="grid gap-2"><span className="label">Behind-the-scenes details</span><textarea required name="description" rows={5} defaultValue={project?.description ?? ""} placeholder="Production notes, rehearsal details, and what visitors are seeing." className={`${field} py-3`} /></label>
  </>;
}

export function BtsProjectsManager({ initialRows, images, videos }: { initialRows: BtsProject[]; images: Media[]; videos: Media[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  const [coverId, setCoverId] = useState(""); const [videoId, setVideoId] = useState("");
  const [mode, setMode] = useState<"r2" | "youtube">("r2");

  function payload(formData: FormData, project?: BtsProject, media?: { coverId: string; videoId: string }) {
    const title = String(formData.get("title") ?? "").trim();
    const nextCover = media?.coverId ?? String(project?.data?.coverMediaId ?? project?.mediaIds?.[0] ?? "");
    const nextVideo = media?.videoId ?? String(project?.data?.videoMediaId ?? "");
    return { title, slug: project?.slug || slugify(title), description: String(formData.get("description") ?? ""), mediaIds: [nextCover, nextVideo].filter(Boolean), data: { ...(project?.data ?? {}), coverMediaId: nextCover || null, videoMediaId: nextVideo || null }, status: project?.status ?? "draft", sortOrder: project?.sortOrder ?? 0, isActive: project?.isActive !== false };
  }

  async function save(formData: FormData, project?: BtsProject, media?: { coverId: string; videoId: string }, publishAfter = false) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(project ? `/api/admin/content/bts-projects/${project._id}` : "/api/admin/content/bts-projects", { method: project ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload(formData, project, media)) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error ?? "Unable to save BTS project.");
      if (publishAfter && result.data?._id) { const published = await fetch(`/api/admin/content/bts-projects/${result.data._id}/publish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: true }) }); if (!published.ok) throw new Error("BTS project was created but could not be published."); setCoverId(""); setVideoId(""); }
      setMessage(project ? "BTS project updated." : "BTS project created and published."); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save BTS project."); } finally { setBusy(false); }
  }
  async function publish(project: BtsProject) { setBusy(true); const response = await fetch(`/api/admin/content/bts-projects/${project._id}/publish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: project.status !== "published" }) }); const result = await response.json(); setMessage(response.ok ? project.status === "published" ? "BTS project returned to draft." : "BTS project published." : result.error ?? "Unable to publish."); setBusy(false); if (response.ok) router.refresh(); }
  async function remove(project: BtsProject) { if (!window.confirm(`Delete ${project.title}?`)) return; setBusy(true); const response = await fetch(`/api/admin/content/bts-projects/${project._id}`, { method: "DELETE" }); const result = await response.json(); setMessage(response.ok ? "BTS project deleted." : result.error ?? "Unable to delete."); setBusy(false); if (response.ok) router.refresh(); }

  return <div className="grid gap-7">
    <details open className="border border-sahel/35 bg-sahel/[0.035] p-5"><summary className="cursor-pointer font-serif text-2xl text-papyrus">+ Add new BTS project</summary><div className="mt-5 grid gap-5">
      <div className="grid gap-4 border border-papyrus/10 p-4"><p className="label">Cover photo</p><MediaUploadForm defaultMediaType="image" lockMediaType onUploaded={async (id) => { setCoverId(id); setMessage("Cover ready."); }} />{coverId ? <p className="text-sm text-emerald-200">Cover ready.</p> : null}</div>
      {coverId ? <div className="grid gap-4 border border-papyrus/10 p-4"><p className="label">Optional playable video</p><div className="flex gap-2"><button type="button" onClick={() => setMode("r2")} className={`rounded-full border px-4 py-2 text-xs uppercase ${mode === "r2" ? "border-sahel bg-sahel text-obsidian" : "border-papyrus/15"}`}>CDN / R2</button><button type="button" onClick={() => setMode("youtube")} className={`rounded-full border px-4 py-2 text-xs uppercase ${mode === "youtube" ? "border-sahel bg-sahel text-obsidian" : "border-papyrus/15"}`}>YouTube</button></div>{mode === "r2" ? <MediaUploadForm defaultMediaType="video" lockMediaType onUploaded={async (id) => setVideoId(id)} /> : <YoutubeVideoForm onCreated={async (id) => setVideoId(id)} />}{videoId ? <p className="text-sm text-emerald-200">Video ready.</p> : null}</div> : <p className="text-sm text-amber-200">Upload the cover photo to enable video options.</p>}
      <form action={(data) => save(data, undefined, { coverId, videoId }, true)} className="grid gap-5 border-t border-papyrus/10 pt-5"><Fields /><button disabled={busy || !coverId} className="w-fit rounded-full bg-sahel px-5 py-3 text-xs font-bold uppercase text-obsidian disabled:opacity-50">Create and publish BTS project</button></form>
    </div></details>
    {message ? <p className="border border-papyrus/10 p-4 text-sm text-sahel">{message}</p> : null}
    <div className="grid gap-4">{initialRows.map((project) => <details key={project._id} className="border border-papyrus/10 p-5"><summary className="cursor-pointer"><span className="font-serif text-2xl text-papyrus">{project.title}</span><span className="ml-3 text-xs uppercase text-papyrus/45">{project.status ?? "draft"}</span></summary><div className="mt-5 grid gap-5"><InlineStoryMediaManager story={project} images={images} videos={videos} resource="bts-projects" label="BTS project" /><form action={(data) => save(data, project)} className="grid gap-5"><Fields project={project} /><div className="flex flex-wrap gap-3"><button disabled={busy} className="rounded-full bg-sahel px-4 py-2 text-xs font-bold uppercase text-obsidian">Save changes</button><button type="button" disabled={busy} onClick={() => publish(project)} className="rounded-full border border-papyrus/20 px-4 py-2 text-xs uppercase">{project.status === "published" ? "Unpublish" : "Publish"}</button><button type="button" disabled={busy} onClick={() => remove(project)} className="rounded-full border border-red-400/30 px-4 py-2 text-xs uppercase text-red-200">Delete</button></div></form></div></details>)}</div>
  </div>;
}
