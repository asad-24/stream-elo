import { type NextRequest } from "next/server";
import { z } from "zod";
import { apiData, apiError } from "@/lib/server/api-response";
import { canAccessAdminArea, getAdminUserFromRequest, hashAdminPassword } from "@/lib/server/admin-auth";
import { adminRoleSchema } from "@/lib/server/cms-models";
import { serializeDocument } from "@/lib/server/cms-resources";
import { collections, getDb } from "@/lib/server/mongodb";
const schema = z.object({ name: z.string().trim().min(2).max(120), email: z.string().trim().email().transform((value) => value.toLowerCase()), password: z.string().min(12).max(200), role: adminRoleSchema });
export async function GET(request: NextRequest) { const user = await getAdminUserFromRequest(request); if (!user || !canAccessAdminArea(user.role, "super-admin")) return apiError("Super-admin role required", user ? 403 : 401); const rows = await (await getDb()).collection(collections.users).find({}, { projection: { passwordHash: 0 } }).sort({ createdAt: -1 }).toArray(); return apiData(serializeDocument(rows)); }
export async function POST(request: NextRequest) { const user = await getAdminUserFromRequest(request); if (!user || !canAccessAdminArea(user.role, "super-admin")) return apiError("Super-admin role required", user ? 403 : 401); const parsed = schema.safeParse(await request.json()); if (!parsed.success) return apiError("Invalid user", 400, parsed.error.flatten()); const now = new Date(); try { const result = await (await getDb()).collection(collections.users).insertOne({ name: parsed.data.name, email: parsed.data.email, passwordHash: await hashAdminPassword(parsed.data.password), role: parsed.data.role, isActive: true, createdAt: now, updatedAt: now }); return apiData({ id: result.insertedId.toHexString(), name: parsed.data.name, email: parsed.data.email, role: parsed.data.role, isActive: true }, { status: 201 }); } catch { return apiError("Email already exists", 409); } }
