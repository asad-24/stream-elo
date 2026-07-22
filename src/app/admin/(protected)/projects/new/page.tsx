import { redirect } from "next/navigation";
import { AdminPage } from "@/components/admin/admin-page";
import { AdminCard, AdminNotice } from "@/components/admin/admin-widgets";
import { getCurrentAdminUser } from "@/lib/server/admin-auth";
import { slugify } from "@/lib/server/media-validation";
import { collections, getDb } from "@/lib/server/mongodb";

export const dynamic = "force-dynamic";

async function createProject(formData: FormData) {
  "use server";

  const user = await getCurrentAdminUser();
  if (!user) redirect("/admin/login");

  const title = String(formData.get("title") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const category = String(formData.get("category") ?? "film").trim();
  const status = String(formData.get("status") ?? "draft").trim();
  const shortDescription = String(formData.get("shortDescription") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!title) redirect("/admin/projects/new?error=missing-title");

  const now = new Date();
  const db = await getDb();
  await db.collection(collections.projects).insertOne({
    title,
    slug: slugify(rawSlug || title),
    shortDescription,
    description,
    category,
    featured: false,
    status,
    sortOrder: 0,
    galleryMediaIds: [],
    createdAt: now,
    updatedAt: now,
  });

  redirect("/admin/projects");
}

export default async function AdminNewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const error = (await searchParams).error;

  return (
    <AdminPage
      eyebrow="Projects"
      title="Create project"
      intro="Create a MongoDB-backed project record. Media assignment can be added after Drive image and video records exist."
    >
      {error ? <AdminNotice tone="error">Project title is required.</AdminNotice> : null}
      <div className="mt-6">
        <AdminCard title="Project details" eyebrow="MongoDB record">
          <form action={createProject} className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="label">Title</span>
                <input
                  name="title"
                  required
                  className="min-h-12 border border-papyrus/15 bg-obsidian px-4 text-papyrus"
                />
              </label>
              <label className="grid gap-2">
                <span className="label">Slug</span>
                <input
                  name="slug"
                  placeholder="auto-generated from title"
                  className="min-h-12 border border-papyrus/15 bg-obsidian px-4 text-papyrus placeholder:text-papyrus/35"
                />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="label">Category</span>
                <select
                  name="category"
                  className="min-h-12 border border-papyrus/15 bg-obsidian px-4 text-papyrus"
                >
                  <option value="film">Film</option>
                  <option value="documentary">Documentary</option>
                  <option value="theatre">Theatre</option>
                  <option value="music">Music</option>
                  <option value="portfolio">Portfolio</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="grid gap-2">
                <span className="label">Status</span>
                <select
                  name="status"
                  className="min-h-12 border border-papyrus/15 bg-obsidian px-4 text-papyrus"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
            </div>
            <label className="grid gap-2">
              <span className="label">Short description</span>
              <textarea
                name="shortDescription"
                rows={3}
                className="border border-papyrus/15 bg-obsidian px-4 py-3 text-papyrus"
              />
            </label>
            <label className="grid gap-2">
              <span className="label">Full description</span>
              <textarea
                name="description"
                rows={6}
                className="border border-papyrus/15 bg-obsidian px-4 py-3 text-papyrus"
              />
            </label>
            <button className="min-h-12 w-fit rounded-full bg-sahel px-5 font-label text-xs font-bold uppercase tracking-[0.18em] text-obsidian">
              Save project
            </button>
          </form>
        </AdminCard>
      </div>
    </AdminPage>
  );
}
