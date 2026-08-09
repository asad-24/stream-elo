import { ObjectId, type Filter } from "mongodb";
import { type NextRequest } from "next/server";
import { z } from "zod";
import { apiData, apiError } from "@/lib/server/api-response";
import { getAdminUserFromRequest } from "@/lib/server/admin-auth";
import { serializeDocument } from "@/lib/server/cms-resources";
import { type MediaAsset } from "@/lib/server/cms-models";
import { collections, getDb } from "@/lib/server/mongodb";
import { slugify } from "@/lib/server/media-validation";
import { youtubeVideoId } from "@/lib/utils";

const youtubeSchema = z.object({
  source: z.literal("youtube"),
  url: z.string().trim().url().max(2048),
  title: z.string().trim().min(1).max(180),
  caption: z.string().trim().max(500).optional(),
}).strict();

export async function GET(request: NextRequest) {
  const user = await getAdminUserFromRequest(request);
  if (!user) return apiError("Unauthorized", 401);
  const page = Math.max(1, Number(request.nextUrl.searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get("limit") ?? 25)));
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const filter: Filter<MediaAsset> = q ? { $or: [{ title: { $regex: q, $options: "i" } }, { originalName: { $regex: q, $options: "i" } }, { r2Key: { $regex: q, $options: "i" } }] } : {};
  const collection = (await getDb()).collection<MediaAsset>(collections.mediaAssets);
  const [rows, total] = await Promise.all([collection.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(), collection.countDocuments(filter)]);
  return apiData(serializeDocument(rows), { pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}

export async function POST(request: NextRequest) {
  const user = await getAdminUserFromRequest(request);
  if (!user) return apiError("Unauthorized", 401);
  const parsed = youtubeSchema.safeParse(await request.json());
  if (!parsed.success) return apiError("Invalid YouTube video input", 400, parsed.error.flatten());
  const videoId = youtubeVideoId(parsed.data.url);
  if (!videoId) return apiError("Enter a valid YouTube video URL", 400);

  const now = new Date();
  const record = {
    title: parsed.data.title,
    slug: `${slugify(parsed.data.title)}-${new ObjectId().toString().slice(-6)}`,
    mediaType: "video" as const,
    source: "youtube" as const,
    publicUrl: `https://www.youtube.com/watch?v=${videoId}`,
    originalName: videoId,
    mimeType: "video/youtube",
    caption: parsed.data.caption || undefined,
    visibility: "public" as const,
    allowDownload: false,
    status: "ready" as const,
    featured: false,
    sortOrder: 0,
    createdBy: user._id,
    createdAt: now,
    updatedAt: now,
  };
  try {
    const result = await (await getDb()).collection(collections.mediaAssets).insertOne(record);
    return apiData(serializeDocument({ ...record, _id: result.insertedId }), { status: 201 });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Unable to save YouTube video", 500);
  }
}
