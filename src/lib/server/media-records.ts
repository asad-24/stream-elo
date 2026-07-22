import "server-only";

import { ObjectId, type WithId } from "mongodb";
import { type MediaAsset } from "@/lib/server/cms-models";
import { collections, getDb } from "@/lib/server/mongodb";

export type MediaRecord = WithId<MediaAsset>;

export function parseObjectId(value: string) {
  return ObjectId.isValid(value) ? new ObjectId(value) : null;
}

export async function findMediaById(mediaId: string) {
  const objectId = parseObjectId(mediaId);
  if (!objectId) return null;

  const db = await getDb();
  return db
    .collection<MediaAsset>(collections.mediaAssets)
    .findOne({ _id: objectId });
}

export function isPublishedPublicMedia(media: MediaAsset) {
  return (
    media.visibility === "public" &&
    (media.status === "published" || media.status === "ready")
  );
}

export function canReadMedia(media: MediaAsset, isAdmin: boolean) {
  if (isPublishedPublicMedia(media)) return true;
  if (isAdmin && media.status !== "archived") return true;
  return false;
}

export function canDownloadMedia(media: MediaAsset, isAdmin: boolean) {
  if (!media.allowDownload && !isAdmin) return false;
  return canReadMedia(media, isAdmin);
}

export function safeDownloadFilename(name: string) {
  const cleaned = name
    .trim()
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, " ")
    .slice(0, 180);

  return cleaned || "download";
}
