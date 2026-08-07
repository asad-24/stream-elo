import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { AdminPage } from "@/components/admin/admin-page";
import { AdminCard } from "@/components/admin/admin-widgets";
import { PageSectionEditor } from "@/components/admin/page-section-editor";
import { getAdminMediaOptions } from "@/lib/server/admin-data";
import { collections, getDb } from "@/lib/server/mongodb";

export const dynamic = "force-dynamic";
export default async function EditPageSection({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id; if (!ObjectId.isValid(id)) notFound();
  const record = await (await getDb()).collection(collections.pageSections).findOne({ _id: new ObjectId(id) }); if (!record) notFound();
  const [images, videos] = await Promise.all([getAdminMediaOptions("image"), getAdminMediaOptions("video")]);
  return <AdminPage eyebrow="Pages" title={`Edit ${String(record.page)} / ${String(record.section)}`} intro="Save a draft, attach uploaded R2 media, and explicitly publish when ready."><AdminCard title="Section content" eyebrow={String(record.status ?? "draft")}><PageSectionEditor section={{ id, page: String(record.page), section: String(record.section), sectionType: String(record.sectionType ?? record.section), heading: String(record.heading ?? ""), subheading: String(record.subheading ?? ""), body: String(record.body ?? ""), status: String(record.status ?? "draft"), sortOrder: Number(record.sortOrder ?? 0), isActive: record.isActive !== false, mediaIds: Array.isArray(record.mediaIds) ? record.mediaIds.map(String) : [], data: record.data && typeof record.data === "object" ? record.data as Record<string, unknown> : {} }} media={[...images, ...videos]} /></AdminCard></AdminPage>;
}
