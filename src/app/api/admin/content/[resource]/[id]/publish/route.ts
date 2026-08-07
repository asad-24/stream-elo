import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { type NextRequest } from "next/server";
import { z } from "zod";
import { apiData, apiError } from "@/lib/server/api-response";
import { canAccessAdminArea, getAdminUserFromRequest } from "@/lib/server/admin-auth";
import { getCmsResource, serializeDocument } from "@/lib/server/cms-resources";
import { getDb } from "@/lib/server/mongodb";

export const runtime = "nodejs";
const inputSchema = z.object({ published: z.boolean().default(true) });

export async function POST(request: NextRequest, context: { params: Promise<{ resource: string; id: string }> }) {
  const user = await getAdminUserFromRequest(request);
  if (!user) return apiError("Unauthorized", 401);
  if (!canAccessAdminArea(user.role, "admin")) return apiError("Admin role required to publish", 403);
  const { resource, id } = await context.params;
  const config = getCmsResource(resource);
  if (!config || !ObjectId.isValid(id)) return apiError("Content not found", 404);
  const parsed = inputSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return apiError("Invalid publish input", 400, parsed.error.flatten());
  const now = new Date();
  const row = await (await getDb()).collection(config.collection).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { status: parsed.data.published ? "published" : "draft", publishedAt: parsed.data.published ? now : null, updatedBy: user._id, updatedAt: now } },
    { returnDocument: "after" },
  );
  if (!row) return apiError("Content not found", 404);
  revalidatePath("/", "layout");
  return apiData(serializeDocument(row));
}
