import { ObjectId } from "mongodb";
import { type NextRequest } from "next/server";
import { apiData, apiError } from "@/lib/server/api-response";
import { getAdminUserFromRequest } from "@/lib/server/admin-auth";
import { getCmsResource, parseCmsInput, serializeDocument } from "@/lib/server/cms-resources";
import { getDb } from "@/lib/server/mongodb";

export const runtime = "nodejs";

export async function GET(request: NextRequest, context: { params: Promise<{ resource: string }> }) {
  const user = await getAdminUserFromRequest(request);
  if (!user) return apiError("Unauthorized", 401);
  const config = getCmsResource((await context.params).resource);
  if (!config) return apiError("Unknown CMS resource", 404);
  const page = Math.max(1, Number(request.nextUrl.searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get("limit") ?? 25)));
  const status = request.nextUrl.searchParams.get("status");
  const filter = status ? { status } : {};
  const db = await getDb();
  const [rows, total] = await Promise.all([
    db.collection(config.collection).find(filter).sort({ sortOrder: 1, updatedAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
    db.collection(config.collection).countDocuments(filter),
  ]);
  return apiData(serializeDocument(rows), { pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}

export async function POST(request: NextRequest, context: { params: Promise<{ resource: string }> }) {
  const user = await getAdminUserFromRequest(request);
  if (!user) return apiError("Unauthorized", 401);
  const config = getCmsResource((await context.params).resource);
  if (!config) return apiError("Unknown CMS resource", 404);
  const parsed = parseCmsInput(config, await request.json());
  if (!parsed.success) return apiError("Invalid content", 400, parsed.issues);
  const now = new Date();
  const document = { ...parsed.data, _id: new ObjectId(), createdBy: user._id, updatedBy: user._id, createdAt: now, updatedAt: now };
  try {
    await (await getDb()).collection(config.collection).insertOne(document);
    return apiData(serializeDocument(document), { status: 201 });
  } catch (error) {
    return apiError(error instanceof Error && error.message.includes("E11000") ? "Slug or section already exists" : "Unable to create content", 409);
  }
}
