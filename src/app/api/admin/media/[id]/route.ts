import { ObjectId } from "mongodb";
import { type NextRequest } from "next/server";
import { z } from "zod";
import { deleteR2Object } from "@/lib/media/r2-storage-provider";
import { apiData, apiError } from "@/lib/server/api-response";
import { canAccessAdminArea, getAdminUserFromRequest } from "@/lib/server/admin-auth";
import { serializeDocument } from "@/lib/server/cms-resources";
import { collections, getDb } from "@/lib/server/mongodb";

const patchSchema = z.object({ title: z.string().trim().min(1).max(180).optional(), altText: z.string().trim().max(240).optional(), caption: z.string().trim().max(500).optional(), visibility: z.enum(["public", "private", "admin"]).optional(), allowDownload: z.boolean().optional(), featured: z.boolean().optional(), sortOrder: z.number().int().optional() }).strict();
type Context = { params: Promise<{ id: string }> };
async function idFrom(context: Context) { const id = (await context.params).id; return ObjectId.isValid(id) ? new ObjectId(id) : null; }

export async function GET(request: NextRequest, context: Context) {
  if (!await getAdminUserFromRequest(request)) return apiError("Unauthorized", 401);
  const id = await idFrom(context); if (!id) return apiError("Media not found", 404);
  const row = await (await getDb()).collection(collections.mediaAssets).findOne({ _id: id });
  return row ? apiData(serializeDocument(row)) : apiError("Media not found", 404);
}
export async function PATCH(request: NextRequest, context: Context) {
  const user = await getAdminUserFromRequest(request); if (!user) return apiError("Unauthorized", 401);
  const id = await idFrom(context); if (!id) return apiError("Media not found", 404);
  const parsed = patchSchema.safeParse(await request.json()); if (!parsed.success) return apiError("Invalid media input", 400, parsed.error.flatten());
  const row = await (await getDb()).collection(collections.mediaAssets).findOneAndUpdate({ _id: id }, { $set: { ...parsed.data, updatedBy: user._id, updatedAt: new Date() } }, { returnDocument: "after" });
  return row ? apiData(serializeDocument(row)) : apiError("Media not found", 404);
}
export async function DELETE(request: NextRequest, context: Context) {
  const user = await getAdminUserFromRequest(request); if (!user) return apiError("Unauthorized", 401);
  if (!canAccessAdminArea(user.role, "super-admin")) return apiError("Super-admin role required", 403);
  const id = await idFrom(context); if (!id) return apiError("Media not found", 404);
  const db = await getDb(); const media = await db.collection(collections.mediaAssets).findOne({ _id: id }); if (!media) return apiError("Media not found", 404);
  const references = await Promise.all([
    db.collection(collections.projects).countDocuments({ $or: [{ posterMediaId: id }, { coverMediaId: id }, { videoMediaId: id }, { galleryMediaIds: id }] }),
    db.collection(collections.pageSections).countDocuments({ $or: [{ mediaIds: id }, { "data.backgroundMediaId": { $in: [id, id.toHexString()] } }, { "data.posterMediaId": { $in: [id, id.toHexString()] } }] }),
    db.collection(collections.galleryItems).countDocuments({ mediaId: id }),
  ]);
  if (references.some(Boolean)) { await db.collection(collections.mediaAssets).updateOne({ _id: id }, { $set: { status: "archived", updatedBy: user._id, updatedAt: new Date() } }); return apiError("Media is referenced and was archived instead of deleted", 409, { references: references.reduce((a, b) => a + b, 0) }); }
  if (media.source === "r2" && media.r2Key) await deleteR2Object(String(media.r2Key));
  await db.collection(collections.mediaAssets).deleteOne({ _id: id }); return apiData({ id: id.toHexString(), deleted: true });
}
