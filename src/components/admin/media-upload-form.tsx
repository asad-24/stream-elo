"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";

type UploadStep = "idle" | "initiating" | "uploading" | "saving" | "done" | "error";

type R2UploadPart = {
  partNumber: number;
  uploadUrl: string;
  start: number;
  end: number;
};

type InitiateResponse =
  | {
      ok: true;
      mediaId: string;
      mode: "single";
      uploadUrl: string;
      publicUrl: string;
    }
  | {
      ok: true;
      mediaId: string;
      mode: "multipart";
      uploadId: string;
      publicUrl: string;
      partSize: number;
      parts: R2UploadPart[];
    }
  | { ok: false; error?: string; message?: string };

type CompletedPart = {
  partNumber: number;
  etag: string;
};

async function uploadWithRetry(url: string, body: Blob, contentType?: string) {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: contentType ? { "Content-Type": contentType } : undefined,
        body,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}.`);
      }

      return response.headers.get("etag")?.replace(/^"|"$/g, "") ?? "";
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Upload failed.");
    }
  }

  if (lastError instanceof TypeError && lastError.message.toLowerCase().includes("fetch")) {
    throw new Error("The browser could not reach Cloudflare R2. Add this admin site's origin to the bucket CORS policy and allow PUT with the Content-Type header.");
  }
  throw lastError ?? new Error("Upload failed.");
}

export function MediaUploadForm({
  defaultMediaType = "video",
  lockMediaType = false,
  onUploaded,
}: {
  defaultMediaType?: "image" | "video";
  lockMediaType?: boolean;
  onUploaded?: (mediaId: string) => void | Promise<void>;
}) {
  const router = useRouter();
  const [mediaType, setMediaType] = useState<"image" | "video">(defaultMediaType);
  const [step, setStep] = useState<UploadStep>("idle");
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setMessage("");
    setProgress(0);

    const data = new FormData(form);
    const file = data.get("file");
    if (!(file instanceof File) || file.size === 0) {
      setStep("error");
      setMessage("Please choose a file first.");
      return;
    }

    try {
      setStep("initiating");
      const initiate = await fetch("/api/admin/r2/upload/initiate", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: file.name,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
          mediaType,
        }),
      });
      const initiateResult = (await initiate.json()) as InitiateResponse;

      if (!initiate.ok || !initiateResult.ok) {
        throw new Error(
          initiateResult.ok
            ? "Unable to initiate upload."
            : initiateResult.message || initiateResult.error || "Unable to initiate upload.",
        );
      }

      setStep("uploading");
      let etag = "";
      let parts: CompletedPart[] | undefined;

      if (initiateResult.mode === "single") {
        etag = await uploadWithRetry(
          initiateResult.uploadUrl,
          file,
          file.type || "application/octet-stream",
        );
        setProgress(100);
      } else {
        const completed: CompletedPart[] = [];
        let uploadedBytes = 0;

        for (const part of initiateResult.parts) {
          const blob = file.slice(part.start, part.end);
          const partEtag = await uploadWithRetry(part.uploadUrl, blob);
          uploadedBytes += blob.size;
          completed.push({ partNumber: part.partNumber, etag: partEtag });
          setProgress(Math.round((uploadedBytes / file.size) * 100));
        }

        parts = completed;
      }

      setStep("saving");
      const complete = await fetch("/api/admin/r2/upload/complete", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mediaId: initiateResult.mediaId,
          mode: initiateResult.mode,
          etag,
          parts,
        }),
      });
      const completeResult = (await complete.json()) as { ok?: boolean; error?: string };

      if (!complete.ok || !completeResult.ok) {
        throw new Error(completeResult.error || "Upload finished, but metadata was not saved.");
      }

      const metadata = await fetch(`/api/admin/media/${initiateResult.mediaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: String(data.get("title") || file.name.replace(/\.[^.]+$/, "")),
          altText: String(data.get("altText") || ""),
          caption: String(data.get("caption") || ""),
          visibility: "public",
          allowDownload: data.get("allowDownload") === "on",
        }),
      });
      if (!metadata.ok) throw new Error("Upload finished, but display details could not be saved.");

      await onUploaded?.(initiateResult.mediaId);

      setStep("done");
      setMessage(`${file.name} was uploaded to R2 and saved.`);
      form.reset();
      router.refresh();
    } catch (error) {
      setStep("error");
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    }
  }

  const isBusy = ["initiating", "uploading", "saving"].includes(step);

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="label">Type</span>
          <select
            name="mediaType"
            value={mediaType}
            disabled={lockMediaType}
            onChange={(event) => setMediaType(event.target.value as "image" | "video")}
            className="min-h-12 border border-papyrus/15 bg-obsidian px-4 text-papyrus"
          >
            <option value="video">Video</option>
            <option value="image">Image</option>
          </select>
        </label>
        <label className="grid gap-2">
          <span className="label">CDN prefix</span>
          <input
            value={mediaType === "image" ? "images/YYYY/MM" : "videos/YYYY/MM"}
            readOnly
            className="min-h-12 border border-papyrus/15 bg-obsidian px-4 text-papyrus"
          />
        </label>
      </div>
      <label className="grid gap-2">
        <span className="label">File</span>
        <input
          name="file"
          type="file"
          accept={mediaType === "image" ? "image/*" : "video/mp4,video/webm,video/quicktime"}
          className="min-h-12 border border-papyrus/15 bg-obsidian px-4 py-3 text-papyrus file:mr-4 file:rounded-full file:border-0 file:bg-sahel file:px-4 file:py-2 file:font-label file:text-xs file:font-bold file:uppercase file:tracking-[0.14em] file:text-obsidian"
        />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2"><span className="label">Display title</span><input name="title" placeholder="Defaults to the filename" className="min-h-12 border border-papyrus/15 bg-obsidian px-4 text-papyrus" /></label>
        <label className="grid gap-2"><span className="label">Alt text</span><input name="altText" placeholder="Describe the image or video poster" className="min-h-12 border border-papyrus/15 bg-obsidian px-4 text-papyrus" /></label>
      </div>
      <label className="grid gap-2"><span className="label">Caption / display details</span><textarea name="caption" rows={3} placeholder="Text shown with this media when a component supports captions" className="border border-papyrus/15 bg-obsidian p-4 text-papyrus" /></label>
      <label className="flex items-center gap-2 text-sm text-papyrus/70"><input type="checkbox" name="allowDownload" /> Allow public download</label>
      <button
        type="submit"
        disabled={isBusy}
        className="inline-flex min-h-12 w-fit items-center gap-2 rounded-full bg-sahel px-5 font-label text-xs font-bold uppercase tracking-[0.18em] text-obsidian disabled:cursor-not-allowed disabled:opacity-55"
      >
        <UploadCloud aria-hidden size={17} />
        {isBusy ? "Uploading" : "Upload to R2"}
      </button>
      {isBusy && progress > 0 ? (
        <div className="h-2 overflow-hidden rounded-full bg-papyrus/10" aria-label="Upload progress">
          <div
            className="h-full bg-sahel transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}
      {message ? (
        <p
          className={`border p-4 text-sm ${
            step === "error"
              ? "border-red-400/30 bg-red-500/10 text-red-100"
              : "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
          }`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
