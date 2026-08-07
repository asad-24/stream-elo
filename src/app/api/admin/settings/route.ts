import { type NextRequest } from "next/server";
import { z } from "zod";
import { apiData, apiError } from "@/lib/server/api-response";
import { canAccessAdminArea, getAdminUserFromRequest } from "@/lib/server/admin-auth";
import { serializeDocument } from "@/lib/server/cms-resources";
import { collections, getDb } from "@/lib/server/mongodb";
const schema = z.object({ key: z.string().trim().min(1).max(160).regex(/^[a-zA-Z0-9._-]+$/), value: z.unknown() });
export async function GET(request: NextRequest) { const user = await getAdminUserFromRequest(request); if (!user || !canAccessAdminArea(user.role, "admin")) return apiError("Admin role required", user ? 403 : 401); return apiData(serializeDocument(await (await getDb()).collection(collections.siteSettings).find({}).sort({ key: 1 }).toArray())); }
export async function POST(request: NextRequest) { const user = await getAdminUserFromRequest(request); if (!user || !canAccessAdminArea(user.role, "admin")) return apiError("Admin role required", user ? 403 : 401); const parsed = schema.safeParse(await request.json()); if (!parsed.success) return apiError("Invalid setting", 400, parsed.error.flatten()); const now = new Date(); const row = await (await getDb()).collection(collections.siteSettings).findOneAndUpdate({ key: parsed.data.key }, { $set: { value: parsed.data.value, updatedBy: user._id, updatedAt: now }, $setOnInsert: { createdAt: now } }, { upsert: true, returnDocument: "after" }); return apiData(serializeDocument(row), { status: 201 }); }
