import { apiData, apiError } from "@/lib/server/api-response";
import { findPublishedBySlug } from "@/lib/server/public-cms";
import { collections } from "@/lib/server/mongodb";
export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) { const row = await findPublishedBySlug(collections.projects, (await context.params).slug); return row ? apiData(row) : apiError("Project not found", 404); }
