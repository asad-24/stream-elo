"use client";

import { useMemo, useState } from "react";
import { UploadCloud } from "lucide-react";

type FolderOption = {
  label: string;
  value: string;
  mediaType: "image" | "video";
};

type UploadStep = "idle" | "initiating" | "uploading" | "saving" | "done" | "error";

type InitiateResponse =
  | { ok: true; mediaId: string; uploadUrl: string }
  | { ok: false; error?: string; message?: string };

type DriveUploadResponse = {
  id?: string;
  name?: string;
};

export function MediaUploadForm({
  defaultMediaType = "video",
  folderOptions,
}: {
  defaultMediaType?: "image" | "video";
  folderOptions: FolderOption[];
}) {
  const [mediaType, setMediaType] = useState<"image" | "video">(defaultMediaType);
  const [folderId, setFolderId] = useState("");
  const [step, setStep] = useState<UploadStep>("idle");
  const [message, setMessage] = useState("");

  const visibleFolders = useMemo(
    () => folderOptions.filter((folder) => folder.mediaType === mediaType),
    [folderOptions, mediaType],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const data = new FormData(event.currentTarget);
    const file = data.get("file");
    if (!(file instanceof File) || file.size === 0) {
      setStep("error");
      setMessage("Please choose a file first.");
      return;
    }

    try {
      setStep("initiating");
      const initiate = await fetch("/api/admin/drive/upload/initiate", {
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
          folderId: folderId || undefined,
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
      const driveResponse = await fetch(initiateResult.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!driveResponse.ok) {
        throw new Error(`Google Drive upload failed with status ${driveResponse.status}.`);
      }

      const driveFile = (await driveResponse.json()) as DriveUploadResponse;
      if (!driveFile.id) throw new Error("Google Drive did not return a file ID.");

      setStep("saving");
      const complete = await fetch("/api/admin/drive/upload/complete", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mediaId: initiateResult.mediaId,
          driveFileId: driveFile.id,
        }),
      });
      const completeResult = (await complete.json()) as { ok?: boolean; error?: string };

      if (!complete.ok || !completeResult.ok) {
        throw new Error(completeResult.error || "Upload finished, but metadata was not saved.");
      }

      setStep("done");
      setMessage(`${driveFile.name || file.name} was uploaded and saved.`);
      event.currentTarget.reset();
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
            onChange={(event) => {
              setMediaType(event.target.value as "image" | "video");
              setFolderId("");
            }}
            className="min-h-12 border border-papyrus/15 bg-obsidian px-4 text-papyrus"
          >
            <option value="video">Video</option>
            <option value="image">Image</option>
          </select>
        </label>
        <label className="grid gap-2">
          <span className="label">Drive folder</span>
          <select
            name="folderId"
            value={folderId}
            onChange={(event) => setFolderId(event.target.value)}
            className="min-h-12 border border-papyrus/15 bg-obsidian px-4 text-papyrus"
          >
            <option value="">Default folder</option>
            {visibleFolders.map((folder) => (
              <option key={`${folder.label}-${folder.value}`} value={folder.value}>
                {folder.label}
              </option>
            ))}
          </select>
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
      <button
        type="submit"
        disabled={isBusy}
        className="inline-flex min-h-12 w-fit items-center gap-2 rounded-full bg-sahel px-5 font-label text-xs font-bold uppercase tracking-[0.18em] text-obsidian disabled:cursor-not-allowed disabled:opacity-55"
      >
        <UploadCloud aria-hidden size={17} />
        {isBusy ? "Uploading" : "Upload to Drive"}
      </button>
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
