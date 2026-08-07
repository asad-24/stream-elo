import { apiData, apiError } from "@/lib/server/api-response"; import { serializeDocument } from "@/lib/server/cms-resources"; import { collections, getDb } from "@/lib/server/mongodb";
const publicKeys = ["site.name", "site.description", "contact", "navigation", "socialLinks"];
export async function GET() { try { const rows = await (await getDb()).collection(collections.siteSettings).find({ key: { $in: publicKeys } }).toArray(); return apiData(serializeDocument(Object.fromEntries(rows.map((row) => [row.key, row.value])))); } catch { return apiError("Unable to load settings", 503); } }
