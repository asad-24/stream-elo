import { ObjectId } from "mongodb";
import { notFound, redirect } from "next/navigation";
import { AdminPage } from "@/components/admin/admin-page";
import { AdminCard, AdminNotice } from "@/components/admin/admin-widgets";
import { getCurrentAdminUser } from "@/lib/server/admin-auth";
import { slugify } from "@/lib/server/media-validation";
import { collections, getDb } from "@/lib/server/mongodb";

export const dynamic = "force-dynamic";

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

async function updateProject(formData: FormData) {
  "use server";

  const user = await getCurrentAdminUser();
  if (!user) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const category = String(formData.get("category") ?? "film").trim();
  const status = String(formData.get("status") ?? "draft").trim();
  const shortDescription = String(formData.get("shortDescription") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!ObjectId.isValid(id)) notFound();
  if (!title) redirect(`/admin/projects/${id}/edit?error=missing-title`);

  const db = await getDb();
  await db.collection(collections.projects).updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        title,
        slug: slugify(rawSlug || title),
        category,
        status,
        shortDescription,
        description,
        updatedAt: new Date(),
      },
    },
  );

  redirect("/admin/projects");
}

export default async function AdminEditProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  if (!ObjectId.isValid(id)) notFound();

  const db = await getDb();
  const project = await db.collection(collections.projects).findOne({
    _id: new ObjectId(id),
  });

  if (!project) notFound();

  return (
    <AdminPage
      eyebrow="Projects"
      title="Edit project"
      intro={`Update ${stringValue(project.title) || "this project"} in MongoDB.`}
    >
      {error ? <AdminNotice tone="error">Project title is required.</AdminNotice> : null}
      <div className="mt-6">
        <AdminCard title="Project details" eyebrow={id}>
          <form action={updateProject} className="grid gap-5">
            <input type="hidden" name="id" value={id} />
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="label">Title</span>
                <input
                  name="title"
                  required
                  defaultValue={stringValue(project.title)}
                  className="min-h-12 border border-papyrus/15 bg-obsidian px-4 text-papyrus"
                />
              </label>
              <label className="grid gap-2">
                <span className="label">Slug</span>
                <input
                  name="slug"
                  defaultValue={stringValue(project.slug)}
                  className="min-h-12 border border-papyrus/15 bg-obsidian px-4 text-papyrus"
                />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="label">Category</span>
                <select
                  name="category"
                  defaultValue={stringValue(project.category) || "film"}
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
                  defaultValue={stringValue(project.status) || "draft"}
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
                defaultValue={stringValue(project.shortDescription)}
                className="border border-papyrus/15 bg-obsidian px-4 py-3 text-papyrus"
              />
            </label>
            <label className="grid gap-2">
              <span className="label">Full description</span>
              <textarea
                name="description"
                rows={6}
                defaultValue={stringValue(project.description)}
                className="border border-papyrus/15 bg-obsidian px-4 py-3 text-papyrus"
              />
            </label>
            <button className="min-h-12 w-fit rounded-full bg-sahel px-5 font-label text-xs font-bold uppercase tracking-[0.18em] text-obsidian">
              Save changes
            </button>
          </form>
        </AdminCard>
      </div>
    </AdminPage>
  );
}
