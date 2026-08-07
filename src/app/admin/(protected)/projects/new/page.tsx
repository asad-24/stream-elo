import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import { AdminPage } from "@/components/admin/admin-page";
import { AdminCard, AdminNotice } from "@/components/admin/admin-widgets";
import { getCurrentAdminUser } from "@/lib/server/admin-auth";
import { getAdminMediaOptions } from "@/lib/server/admin-data";
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
  const director = String(formData.get("director") ?? "").trim();
  const cast = String(formData.get("cast") ?? "").split("\n").map((value) => value.trim()).filter(Boolean);
  const year = String(formData.get("year") ?? "").trim();
  const duration = String(formData.get("duration") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const productionDate = String(formData.get("productionDate") ?? "").trim();
  const publicStatus = String(formData.get("publicStatus") ?? "Upcoming").trim();
  const credits = String(formData.get("credits") ?? "").split("\n").map((value) => value.trim()).filter(Boolean);
  const posterMediaId = String(formData.get("posterMediaId") ?? "");
  const coverMediaId = String(formData.get("coverMediaId") ?? "");
  const videoMediaId = String(formData.get("videoMediaId") ?? "");
  const galleryMediaIds = formData
    .getAll("galleryMediaIds")
    .map(String)
    .filter((value) => ObjectId.isValid(value))
    .map((value) => new ObjectId(value));

  if (!title) redirect("/admin/projects/new?error=missing-title");

  const now = new Date();
  const db = await getDb();
  await db.collection(collections.projects).insertOne({
    title,
    slug: slugify(rawSlug || title),
    shortDescription,
    description,
    director, cast, year, duration, location, productionDate, publicStatus, credits,
    category,
    ...(ObjectId.isValid(posterMediaId)
      ? { posterMediaId: new ObjectId(posterMediaId) }
      : undefined),
    ...(ObjectId.isValid(coverMediaId)
      ? { coverMediaId: new ObjectId(coverMediaId) }
      : undefined),
    ...(ObjectId.isValid(videoMediaId)
      ? { videoMediaId: new ObjectId(videoMediaId) }
      : undefined),
    featured: false,
    status,
    sortOrder: 0,
    galleryMediaIds,
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
  const [imageOptions, videoOptions] = await Promise.all([
    getAdminMediaOptions("image"),
    getAdminMediaOptions("video"),
  ]);

  return (
    <AdminPage
      eyebrow="Projects"
      title="Create project"
      intro="Create a MongoDB-backed project record and assign ready R2 image and video media."
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
            <div className="grid gap-4 md:grid-cols-3">
              <label className="grid gap-2">
                <span className="label">Poster image</span>
                <select
                  name="posterMediaId"
                  className="min-h-12 border border-papyrus/15 bg-obsidian px-4 text-papyrus"
                >
                  <option value="">Fallback artwork</option>
                  {imageOptions.map((image) => (
                    <option key={image.id} value={image.id}>
                      {image.title}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2"><span className="label">Director</span><input name="director" className="min-h-12 border border-papyrus/15 bg-obsidian px-4 text-papyrus" /></label>
                <label className="grid gap-2"><span className="label">Public status</span><input name="publicStatus" defaultValue="Upcoming" placeholder="Live, Streaming, Completed..." className="min-h-12 border border-papyrus/15 bg-obsidian px-4 text-papyrus" /></label>
                <label className="grid gap-2"><span className="label">Year</span><input name="year" className="min-h-12 border border-papyrus/15 bg-obsidian px-4 text-papyrus" /></label>
                <label className="grid gap-2"><span className="label">Duration</span><input name="duration" placeholder="98 min" className="min-h-12 border border-papyrus/15 bg-obsidian px-4 text-papyrus" /></label>
                <label className="grid gap-2"><span className="label">Location</span><input name="location" className="min-h-12 border border-papyrus/15 bg-obsidian px-4 text-papyrus" /></label>
                <label className="grid gap-2"><span className="label">Production date</span><input name="productionDate" className="min-h-12 border border-papyrus/15 bg-obsidian px-4 text-papyrus" /></label>
              </div>
              <div className="grid gap-4 md:grid-cols-2"><label className="grid gap-2"><span className="label">Cast — one per line</span><textarea name="cast" rows={5} className="border border-papyrus/15 bg-obsidian p-4 text-papyrus" /></label><label className="grid gap-2"><span className="label">Credits — one per line</span><textarea name="credits" rows={5} className="border border-papyrus/15 bg-obsidian p-4 text-papyrus" /></label></div>
              <label className="grid gap-2">
                <span className="label">Cover image</span>
                <select
                  name="coverMediaId"
                  className="min-h-12 border border-papyrus/15 bg-obsidian px-4 text-papyrus"
                >
                  <option value="">Fallback artwork</option>
                  {imageOptions.map((image) => (
                    <option key={image.id} value={image.id}>
                      {image.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2">
                <span className="label">Video</span>
                <select
                  name="videoMediaId"
                  className="min-h-12 border border-papyrus/15 bg-obsidian px-4 text-papyrus"
                >
                  <option value="">No video</option>
                  {videoOptions.map((video) => (
                    <option key={video.id} value={video.id}>
                      {video.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="grid gap-2">
              <span className="label">Gallery images</span>
              <select
                name="galleryMediaIds"
                multiple
                size={Math.min(Math.max(imageOptions.length, 3), 8)}
                className="border border-papyrus/15 bg-obsidian px-4 py-3 text-papyrus"
              >
                {imageOptions.map((image) => (
                  <option key={image.id} value={image.id}>
                    {image.title}
                  </option>
                ))}
              </select>
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
