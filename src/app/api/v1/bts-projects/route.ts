import { apiData, apiError } from "@/lib/server/api-response"; import { listPublished } from "@/lib/server/public-cms"; import { collections } from "@/lib/server/mongodb";
export async function GET() { try { return apiData(await listPublished(collections.btsProjects)); } catch { return apiError("Unable to load BTS projects", 503); } }
