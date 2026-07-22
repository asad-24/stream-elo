import { ObjectId } from "mongodb";
import { extractGoogleDriveFileId } from "../src/lib/google-drive/extract-file-id";
import { getFileMetadata } from "../src/lib/google-drive/media-service";
import { collections, getDb } from "../src/lib/server/mongodb";
import { slugify } from "../src/lib/server/media-validation";

type ImportCandidate = {
  sourceFile: string;
  value: string;
};

const knownCandidates: ImportCandidate[] = [
  {
    sourceFile: "Task instructions",
    value: "https://drive.google.com/drive/folders/1YJcHwuAvvQNeZiT4cnVm_VyTaUSNn2P3",
  },
  {
    sourceFile: "Task instructions",
    value: "https://drive.google.com/drive/folders/1d2zIfC6a4uZNxJNOjQJOCleiN819n4Sx",
  },
];

function mediaTypeFromMime(mimeType: string) {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return null;
}

export async function importExistingDriveMedia(candidates = knownCandidates) {
  const db = await getDb();
  const media = db.collection(collections.mediaAssets);
  const report: Array<Record<string, unknown>> = [];

  for (const candidate of candidates) {
    const driveFileId = extractGoogleDriveFileId(candidate.value);

    if (!driveFileId) {
      report.push({
        sourceFile: candidate.sourceFile,
        value: candidate.value,
        status: "skipped",
        reason: "No Drive file ID found. Folder links must be listed first.",
      });
      continue;
    }

    const existing = await media.findOne({ driveFileId });
    if (existing) {
      report.push({
        sourceFile: candidate.sourceFile,
        value: candidate.value,
        driveFileId,
        status: "skipped",
        reason: "Media record already exists.",
      });
      continue;
    }

    const metadata = await getFileMetadata(driveFileId);
    const mediaType = mediaTypeFromMime(metadata.mimeType);

    if (!mediaType) {
      report.push({
        sourceFile: candidate.sourceFile,
        value: candidate.value,
        driveFileId,
        status: "skipped",
        reason: `Unsupported MIME type: ${metadata.mimeType}`,
      });
      continue;
    }

    const now = new Date();
    const title = metadata.name.replace(/\.[^.]+$/, "");
    const createdBy = new ObjectId("000000000000000000000000");

    await media.insertOne({
      title,
      slug: `${slugify(title)}-${driveFileId.slice(-6)}`,
      mediaType,
      source: "google-drive",
      driveFileId,
      driveFolderId: metadata.parents?.[0],
      originalName: metadata.name,
      mimeType: metadata.mimeType,
      size: metadata.size ? Number(metadata.size) : undefined,
      visibility: "admin",
      allowDownload: false,
      status: "ready",
      featured: false,
      sortOrder: 0,
      createdBy,
      createdAt: now,
      updatedAt: now,
    });

    report.push({
      sourceFile: candidate.sourceFile,
      value: candidate.value,
      driveFileId,
      status: "imported",
      name: metadata.name,
      mimeType: metadata.mimeType,
    });
  }

  return report;
}
