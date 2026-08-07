import { notFound } from "next/navigation";
import { AdminPage } from "@/components/admin/admin-page";
import { AdminCard } from "@/components/admin/admin-widgets";
import { ContentManager } from "@/components/admin/content-manager";
import { getCmsResource, serializeDocument } from "@/lib/server/cms-resources";
import { getDb } from "@/lib/server/mongodb";
import { getAdminMediaOptions } from "@/lib/server/admin-data";
export const dynamic = "force-dynamic";
const allowed = ["categories", "success-stories", "bts-projects", "galleries", "statistics", "benefits"];
export default async function ResourcePage({ params }: { params: Promise<{ resource: string }> }) { const resource = (await params).resource; if (!allowed.includes(resource)) notFound(); const config = getCmsResource(resource); if (!config) notFound(); const [rows, images] = await Promise.all([(await getDb()).collection(config.collection).find({}).sort({ sortOrder: 1 }).limit(200).toArray(), getAdminMediaOptions("image")]); return <AdminPage eyebrow="Content" title={resource.replaceAll("-", " ")} intro="Create drafts, attach uploaded R2 media, edit every field, and control what is published."><AdminCard title="Content records" eyebrow={`${rows.length} records`}><ContentManager resource={resource} initialRows={serializeDocument(rows) as Array<{ _id: string; title?: string; name?: string; slug: string; description?: string; status?: string; sortOrder?: number; isActive?: boolean; mediaIds?: string[]; data?: Record<string, unknown>; type?: string }>} media={images} /></AdminCard></AdminPage>; }
