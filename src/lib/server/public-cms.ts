import "server-only";
import { ObjectId } from "mongodb";
import { serializeDocument } from "@/lib/server/cms-resources";
import { collections, getDb } from "@/lib/server/mongodb";

export async function listPublished(collection: string, filter: Record<string, unknown> = {}) {
  const rows = await (await getDb()).collection(collection).find({ ...filter, status: "published", isActive: { $ne: false } }).sort({ sortOrder: 1, publishedAt: -1 }).toArray();
  return serializeDocument(rows);
}

export async function findPublishedBySlug(collection: string, slug: string) {
  const row = await (await getDb()).collection(collection).findOne({ slug, status: "published", isActive: { $ne: false } });
  return row ? serializeDocument(row) : null;
}

export async function resolvePublicMedia(ids: unknown[]) {
  const objectIds = ids.map((value) => value instanceof ObjectId ? value : typeof value === "string" && ObjectId.isValid(value) ? new ObjectId(value) : null).filter((value): value is ObjectId => Boolean(value));
  if (!objectIds.length) return [];
  return (await getDb()).collection(collections.mediaAssets).find({ _id: { $in: objectIds }, visibility: "public", status: { $in: ["ready", "published"] } }).toArray();
}
