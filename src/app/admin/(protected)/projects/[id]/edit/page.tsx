import { ObjectId } from "mongodb";
import { notFound, redirect } from "next/navigation";
import { AdminPage } from "@/components/admin/admin-page";
import { AdminCard, AdminNotice } from "@/components/admin/admin-widgets";
import { getCurrentAdminUser } from "@/lib/server/admin-auth";
import { getAdminMediaOptions } from "@/lib/server/admin-data";
import { slugify } from "@/lib/server/media-validation";
import { collections, getDb } from "@/lib/server/mongodb";

export const dynamic = "force-dynamic";

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function idValue(value: unknown) {
  if (value instanceof ObjectId) return value.toHexString();
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

  if (!ObjectId.isValid(id)) notFound();
  if (!title) redirect(`/admin/projects/${id}/edit?error=missing-title`);

  const mediaSet: Record<string, unknown> = { galleryMediaIds };
  const mediaUnset: Record<string, ""> = {};
  if (ObjectId.isValid(posterMediaId)) {
    mediaSet.posterMediaId = new ObjectId(posterMediaId);
  } else {
    mediaUnset.posterMediaId = "";
  }
  if (ObjectId.isValid(coverMediaId)) {
    mediaSet.coverMediaId = new ObjectId(coverMediaId);
  } else {
    mediaUnset.coverMediaId = "";
  }
  if (ObjectId.isValid(videoMediaId)) {
    mediaSet.videoMediaId = new ObjectId(videoMediaId);
  } else {
    mediaUnset.videoMediaId = "";
  }

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
          director, cast, year, duration, location, productionDate, publicStatus, credits,
        ...mediaSet,
        updatedAt: new Date(),
      },
      ...(Object.keys(mediaUnset).length ? { $unset: mediaUnset } : undefined),
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
  const [project, imageOptions, videoOptions] = await Promise.all([
    db.collection(collections.projects).findOne({
      _id: new ObjectId(id),
    }),
    getAdminMediaOptions("image"),
    getAdminMediaOptions("video"),
  ]);

  if (!project) notFound();
  const selectedGalleryIds = Array.isArray(project.galleryMediaIds)
    ? project.galleryMediaIds.map(idValue)
    : [];

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
            <div className="grid gap-4 md:grid-cols-3">
              <label className="grid gap-2">
                <span className="label">Poster image</span>
                <select
                  name="posterMediaId"
                  defaultValue={idValue(project.posterMediaId)}
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
                <label className="grid gap-2"><span className="label">Director</span><input name="director" defaultValue={String(project.director ?? "")} className="min-h-12 border border-papyrus/15 bg-obsidian px-4 text-papyrus" /></label>
                <label className="grid gap-2"><span className="label">Public status</span><input name="publicStatus" defaultValue={String(project.publicStatus ?? "Upcoming")} className="min-h-12 border border-papyrus/15 bg-obsidian px-4 text-papyrus" /></label>
                <label className="grid gap-2"><span className="label">Year</span><input name="year" defaultValue={String(project.year ?? "")} className="min-h-12 border border-papyrus/15 bg-obsidian px-4 text-papyrus" /></label>
                <label className="grid gap-2"><span className="label">Duration</span><input name="duration" defaultValue={String(project.duration ?? "")} className="min-h-12 border border-papyrus/15 bg-obsidian px-4 text-papyrus" /></label>
                <label className="grid gap-2"><span className="label">Location</span><input name="location" defaultValue={String(project.location ?? "")} className="min-h-12 border border-papyrus/15 bg-obsidian px-4 text-papyrus" /></label>
                <label className="grid gap-2"><span className="label">Production date</span><input name="productionDate" defaultValue={String(project.productionDate ?? "")} className="min-h-12 border border-papyrus/15 bg-obsidian px-4 text-papyrus" /></label>
              </div>
              <div className="grid gap-4 md:grid-cols-2"><label className="grid gap-2"><span className="label">Cast — one per line</span><textarea name="cast" defaultValue={Array.isArray(project.cast) ? project.cast.join("\n") : ""} rows={5} className="border border-papyrus/15 bg-obsidian p-4 text-papyrus" /></label><label className="grid gap-2"><span className="label">Credits — one per line</span><textarea name="credits" defaultValue={Array.isArray(project.credits) ? project.credits.join("\n") : ""} rows={5} className="border border-papyrus/15 bg-obsidian p-4 text-papyrus" /></label></div>
              <label className="grid gap-2">
                <span className="label">Cover image</span>
                <select
                  name="coverMediaId"
                  defaultValue={idValue(project.coverMediaId)}
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
                  defaultValue={idValue(project.videoMediaId)}
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
                defaultValue={selectedGalleryIds}
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
              Save changes
            </button>
          </form>
        </AdminCard>
      </div>
    </AdminPage>
  );
}
