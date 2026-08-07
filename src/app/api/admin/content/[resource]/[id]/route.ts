import { ObjectId } from "mongodb";
import { type NextRequest } from "next/server";
import { apiData, apiError } from "@/lib/server/api-response";
import { canAccessAdminArea, getAdminUserFromRequest } from "@/lib/server/admin-auth";
import { getCmsResource, parseCmsInput, serializeDocument } from "@/lib/server/cms-resources";
import { getDb } from "@/lib/server/mongodb";

export const runtime = "nodejs";
type Context = { params: Promise<{ resource: string; id: string }> };

async function resolve(request: NextRequest, context: Context) {
  const user = await getAdminUserFromRequest(request);
  const params = await context.params;
  return { user, params, config: getCmsResource(params.resource), objectId: ObjectId.isValid(params.id) ? new ObjectId(params.id) : null };
}

export async function GET(request: NextRequest, context: Context) {
  const { user, config, objectId } = await resolve(request, context);
  if (!user) return apiError("Unauthorized", 401);
  if (!config || !objectId) return apiError("Content not found", 404);
  const row = await (await getDb()).collection(config.collection).findOne({ _id: objectId });
  return row ? apiData(serializeDocument(row)) : apiError("Content not found", 404);
}

export async function PATCH(request: NextRequest, context: Context) {
  const { user, config, objectId } = await resolve(request, context);
  if (!user) return apiError("Unauthorized", 401);
  if (!config || !objectId) return apiError("Content not found", 404);
  const parsed = parseCmsInput(config, await request.json());
  if (!parsed.success) return apiError("Invalid content", 400, parsed.issues);
  const editable = { ...parsed.data };
  delete editable.status;
  const row = await (await getDb()).collection(config.collection).findOneAndUpdate(
    { _id: objectId }, { $set: { ...editable, updatedBy: user._id, updatedAt: new Date() } }, { returnDocument: "after" },
  );
  return row ? apiData(serializeDocument(row)) : apiError("Content not found", 404);
}

export async function DELETE(request: NextRequest, context: Context) {
  const { user, config, objectId } = await resolve(request, context);
  if (!user) return apiError("Unauthorized", 401);
  if (!canAccessAdminArea(user.role, "super-admin")) return apiError("Super-admin role required", 403);
  if (!config || !objectId) return apiError("Content not found", 404);
  const result = await (await getDb()).collection(config.collection).deleteOne({ _id: objectId });
  return result.deletedCount ? apiData({ id: objectId.toHexString(), deleted: true }) : apiError("Content not found", 404);
}
