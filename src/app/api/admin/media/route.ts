import { type Filter } from "mongodb";
import { type NextRequest } from "next/server";
import { apiData, apiError } from "@/lib/server/api-response";
import { getAdminUserFromRequest } from "@/lib/server/admin-auth";
import { serializeDocument } from "@/lib/server/cms-resources";
import { type MediaAsset } from "@/lib/server/cms-models";
import { collections, getDb } from "@/lib/server/mongodb";

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

export function POST() { return apiError("Use /api/admin/r2/uploads/initiate to create uploaded media", 405); }
