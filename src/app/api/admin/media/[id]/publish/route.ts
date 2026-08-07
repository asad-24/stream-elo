import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { type NextRequest } from "next/server";
import { apiData, apiError } from "@/lib/server/api-response";
import { canAccessAdminArea, getAdminUserFromRequest } from "@/lib/server/admin-auth";
import { serializeDocument } from "@/lib/server/cms-resources";
import { collections, getDb } from "@/lib/server/mongodb";
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getAdminUserFromRequest(request); if (!user) return apiError("Unauthorized", 401); if (!canAccessAdminArea(user.role, "admin")) return apiError("Admin role required", 403);
  const id = (await context.params).id; if (!ObjectId.isValid(id)) return apiError("Media not found", 404);
  const row = await (await getDb()).collection(collections.mediaAssets).findOneAndUpdate({ _id: new ObjectId(id), status: { $in: ["ready", "published"] } }, { $set: { status: "published", visibility: "public", publishedAt: new Date(), updatedBy: user._id, updatedAt: new Date() } }, { returnDocument: "after" });
  if (!row) return apiError("Only ready media can be published", 409); revalidatePath("/", "layout"); return apiData(serializeDocument(row));
}
