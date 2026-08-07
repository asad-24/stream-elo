import { apiData, apiError } from "@/lib/server/api-response";
import { listPublished } from "@/lib/server/public-cms";
import { collections } from "@/lib/server/mongodb";
export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) { try { return apiData(await listPublished(collections.pageSections, { page: (await context.params).slug })); } catch { return apiError("Unable to load page sections", 503); } }
