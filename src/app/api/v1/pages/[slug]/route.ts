import { apiData, apiError } from "@/lib/server/api-response";
import { findPublishedBySlug, listPublished } from "@/lib/server/public-cms";
import { collections } from "@/lib/server/mongodb";
export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) { const slug = (await context.params).slug; const page = await findPublishedBySlug(collections.pages, slug); if (!page) return apiError("Page not found", 404); const sections = await listPublished(collections.pageSections, { page: slug }); return apiData({ page, sections }); }
