import { ObjectId } from "mongodb";
import { type NextRequest } from "next/server";
import { z } from "zod";
import { apiData, apiError } from "@/lib/server/api-response";
import { getAdminUserFromRequest } from "@/lib/server/admin-auth";
import { getCmsResource } from "@/lib/server/cms-resources";
import { getDb } from "@/lib/server/mongodb";

const schema = z.object({ items: z.array(z.object({ id: z.string().regex(/^[a-f\d]{24}$/i), sortOrder: z.number().int() })).min(1).max(500) });
export async function POST(request: NextRequest, context: { params: Promise<{ resource: string }> }) {
  const user = await getAdminUserFromRequest(request);
  if (!user) return apiError("Unauthorized", 401);
  const config = getCmsResource((await context.params).resource);
  if (!config) return apiError("Unknown CMS resource", 404);
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return apiError("Invalid ordering", 400, parsed.error.flatten());
  const now = new Date();
  await (await getDb()).collection(config.collection).bulkWrite(parsed.data.items.map((item) => ({ updateOne: { filter: { _id: new ObjectId(item.id) }, update: { $set: { sortOrder: item.sortOrder, updatedBy: user._id, updatedAt: now } } } })));
  return apiData({ updated: parsed.data.items.length });
}
