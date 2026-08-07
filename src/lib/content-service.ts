import "server-only";

import { ObjectId, type Document } from "mongodb";
import { collections, getDb } from "@/lib/server/mongodb";
import {
  asset,
  btsProjects,
  contact,
  featuredFilms,
  navigation,
  partnershipBenefits,
  projects,
  type Project,
  type ProjectCategory,
  type ProjectStatus,
  stats,
  successStories,
  theatreProductions,
} from "@/lib/content";

export const fallbackContent = {
  asset,
  btsProjects,
  contact,
  featuredFilms,
  navigation,
  partnershipBenefits,
  projects,
  stats,
  successStories,
  theatreProductions,
};

export async function getPageSectionContent(page: string, section: string) {
  try {
    const db = await getDb();
    return db.collection(collections.pageSections).findOne({
      page,
      section,
      isActive: true,
      status: "published",
    });
  } catch {
    return null;
  }
}

export async function getSiteSetting<T>(key: string, fallback: T): Promise<T> {
  try {
    const db = await getDb();
    const setting = await db.collection(collections.siteSettings).findOne({ key });
    return setting?.value === undefined ? fallback : (setting.value as T);
  } catch {
    return fallback;
  }
}

export async function getProjectsContent() {
  try {
    const db = await getDb();
    const records = await db
      .collection(collections.projects)
      .find({ status: "published" })
      .sort({ featured: -1, sortOrder: 1, publishedAt: -1 })
      .toArray();

    return records.length ? await resolveProjectMedia(records) : fallbackContent.projects;
  } catch {
    return fallbackContent.projects;
  }
}

function asId(value: unknown) {
  if (value instanceof ObjectId) return value.toHexString();
  return typeof value === "string" ? value : "";
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function categoryFromValue(value: unknown): ProjectCategory {
  const normalized = asString(value).toLowerCase();
  if (normalized === "documentary" || normalized === "documentaries") return "Documentaries";
  if (normalized === "theatre") return "Theatre";
  if (normalized === "music") return "Music";
  return "Film";
}

function statusFromValue(value: unknown, fallback: ProjectStatus): ProjectStatus {
  const allowed: ProjectStatus[] = [
    "Live",
    "Upcoming",
    "Streaming",
    "Now Showing",
    "Completed",
    "In Production",
  ];
  const text = asString(value);
  return allowed.includes(text as ProjectStatus) ? (text as ProjectStatus) : fallback;
}

async function resolveProjectMedia(records: Document[]): Promise<Project[]> {
  const mediaIds = new Set<string>();
  for (const project of records) {
    for (const field of ["posterMediaId", "coverMediaId", "videoMediaId"]) {
      const id = asId(project[field]);
      if (id) mediaIds.add(id);
    }

    if (Array.isArray(project.galleryMediaIds)) {
      project.galleryMediaIds.map(asId).filter(Boolean).forEach((id) => mediaIds.add(id));
    }
  }

  const db = await getDb();
  const mediaRecords = mediaIds.size
    ? await db
        .collection(collections.mediaAssets)
        .find({
          _id: { $in: Array.from(mediaIds).map((id) => new ObjectId(id)) },
          source: "r2",
          visibility: "public",
          status: { $in: ["ready", "published"] },
          publicUrl: { $type: "string", $ne: "" },
        })
        .toArray()
    : [];
  const mediaById = new Map(mediaRecords.map((media) => [asId(media._id), media]));

  return records.map((project, index): Project => {
    const fallback = fallbackContent.projects[index % fallbackContent.projects.length];
    const legacyMedia = project.legacyMedia && typeof project.legacyMedia === "object"
      ? project.legacyMedia as Record<string, unknown>
      : {};
    const poster = mediaById.get(asId(project.posterMediaId))?.publicUrl;
    const cover = mediaById.get(asId(project.coverMediaId))?.publicUrl;
    const video = mediaById.get(asId(project.videoMediaId));
    const gallery = Array.isArray(project.galleryMediaIds)
      ? project.galleryMediaIds
          .map((id) => mediaById.get(asId(id))?.publicUrl)
          .filter((url): url is string => Boolean(url))
      : [];

    return {
      title: asString(project.title, fallback.title),
      slug: asString(project.slug, fallback.slug),
      category: categoryFromValue(project.category ?? fallback.category),
      poster: poster ?? asString(legacyMedia.poster, fallback.poster),
      cover: cover ?? poster ?? asString(legacyMedia.cover, fallback.cover),
      shortSynopsis: asString(project.shortDescription, fallback.shortSynopsis),
      fullSynopsis: asString(project.description, fallback.fullSynopsis),
      director: asString(project.director, fallback.director),
      cast: Array.isArray(project.cast) ? project.cast.map(String) : fallback.cast,
      year: asString(project.year, fallback.year),
      duration: asString(project.duration, fallback.duration),
      location: asString(project.location, fallback.location),
      productionDate: asString(project.productionDate, fallback.productionDate),
      status: statusFromValue(project.publicStatus, fallback.status),
      video: video?.publicUrl
        ? { type: "mp4", url: String(video.publicUrl), label: "Play video" }
        : legacyMedia.video && typeof legacyMedia.video === "object"
          ? legacyMedia.video as Project["video"]
          : fallback.video,
      gallery: gallery.length ? gallery : Array.isArray(legacyMedia.gallery) ? legacyMedia.gallery.map(String) : fallback.gallery,
      credits: Array.isArray(project.credits) ? project.credits.map(String) : fallback.credits,
    };
  });
}

export type PublicPageHeader = { eyebrow: string; heading: string; body: string };
export async function getPageHeader(page: string, fallback: PublicPageHeader) {
  const section = await getPageSectionContent(page, "header");
  return section ? {
    eyebrow: asString(section.subheading, fallback.eyebrow),
    heading: asString(section.heading, fallback.heading),
    body: asString(section.body, fallback.body),
  } : fallback;
}

async function publishedRows(collection: string, fallback: Document[] = []): Promise<Document[]> {
  try {
    const rows = await (await getDb()).collection(collection).find({ status: "published", isActive: { $ne: false } }).sort({ sortOrder: 1 }).toArray();
    return rows.length ? rows : fallback;
  } catch { return fallback; }
}

export async function getSuccessStoriesContent() {
  const rows = await publishedRows(collections.successStories, []);
  if (!rows.length) return fallbackContent.successStories;
  const media = await resolveMediaForRows(rows);
  return rows.map((row, index) => {
    const data = row.data && typeof row.data === "object" ? row.data as Record<string, unknown> : {};
    const fallback = fallbackContent.successStories[index % fallbackContent.successStories.length];
    return { name: asString(row.title, fallback.name), role: asString(data.role, fallback.role), image: media.get(asId(Array.isArray(row.mediaIds) ? row.mediaIds[0] : undefined)) ?? asString(data.imageUrl, fallback.image), bio: asString(row.description, fallback.bio), projects: Array.isArray(data.projects) ? data.projects.map(String) : fallback.projects };
  });
}

export async function getBtsContent() {
  const rows = await publishedRows(collections.btsProjects, []);
  if (!rows.length) return fallbackContent.btsProjects;
  const media = await resolveMediaForRows(rows);
  return rows.map((row, index) => {
    const data = row.data && typeof row.data === "object" ? row.data as Record<string, unknown> : {};
    const fallback = fallbackContent.btsProjects[index % fallbackContent.btsProjects.length];
    const ids = Array.isArray(row.mediaIds) ? row.mediaIds : [];
    const captions = Array.isArray(data.captions) ? data.captions.map(String) : [];
    const selected = ids.map((id, mediaIndex) => ({ src: media.get(asId(id)), caption: captions[mediaIndex] || `${asString(row.title, fallback.title)} image ${mediaIndex + 1}` })).filter((item): item is { src: string; caption: string } => Boolean(item.src));
    const legacy = Array.isArray(data.media) ? data.media.filter((item): item is { src: string; caption: string } => Boolean(item && typeof item === "object" && "src" in item && "caption" in item)) : [];
    return { title: asString(row.title, fallback.title), details: asString(row.description, fallback.details), media: selected.length ? selected : legacy.length ? legacy : fallback.media };
  });
}

export async function getTheatreContent() {
  const rows = await publishedRows(collections.galleries, []);
  const theatreRows = rows.filter((row) => asString(row.slug).startsWith("theatre-"));
  if (!theatreRows.length) return fallbackContent.theatreProductions;
  const media = await resolveMediaForRows(theatreRows);
  return theatreRows.map((row, index) => {
    const data = row.data && typeof row.data === "object" ? row.data as Record<string, unknown> : {};
    const fallback = fallbackContent.theatreProductions[index % fallbackContent.theatreProductions.length];
    const ids = Array.isArray(row.mediaIds) ? row.mediaIds : [];
    const urls = ids.map((id) => media.get(asId(id))).filter((url): url is string => Boolean(url));
    return { title: asString(row.title, fallback.title), city: asString(data.city, fallback.city), country: asString(data.country, fallback.country), dates: asString(data.dates, fallback.dates), status: statusFromValue(data.status, fallback.status), poster: urls[0] ?? asString(data.poster, fallback.poster), description: asString(row.description, fallback.description), gallery: urls.length ? urls : Array.isArray(data.gallery) ? data.gallery.map(String) : fallback.gallery };
  });
}

export async function getStatsContent() {
  const rows = await publishedRows(collections.awardStatistics, []);
  if (!rows.length) return fallbackContent.stats;
  return rows.map((row) => { const data = row.data && typeof row.data === "object" ? row.data as Record<string, unknown> : {}; return { value: Number(data.value ?? 0), label: asString(data.label, asString(row.title)) }; });
}

export async function getBenefitsContent() {
  const rows = await publishedRows(collections.partnerBenefits, []);
  if (!rows.length) return fallbackContent.partnershipBenefits;
  return rows.map((row, index) => { const data = row.data && typeof row.data === "object" ? row.data as Record<string, unknown> : {}; return { label: asString(data.label, String(index + 1)), title: asString(row.title), text: asString(row.description) }; });
}

async function resolveMediaForRows(rows: Document[]) {
  const ids = rows.flatMap((row) => Array.isArray(row.mediaIds) ? row.mediaIds : []).map(asId).filter(Boolean);
  if (!ids.length) return new Map<string, string>();
  const records = await (await getDb()).collection(collections.mediaAssets).find({ _id: { $in: ids.map((id) => new ObjectId(id)) }, visibility: "public", status: { $in: ["ready", "published"] }, publicUrl: { $type: "string", $ne: "" } }).toArray();
  return new Map(records.map((item) => [asId(item._id), String(item.publicUrl)]));
}

export async function getHomeContent() {
  let allSections: Document[] = [];
  try { allSections = await (await getDb()).collection(collections.pageSections).find({ page: "home", isActive: true, status: "published" }).sort({ sortOrder: 1 }).toArray(); } catch { /* retain fallbacks */ }
  const heroSection = allSections.find((item) => item.section === "hero") ?? null;
  const introSection = allSections.find((item) => item.section === "intro") ?? null;
  const heroData = heroSection?.data && typeof heroSection.data === "object"
    ? heroSection.data as Record<string, unknown>
    : {};
  const mediaIds = [...allSections.flatMap((section) => Array.isArray(section.mediaIds) ? section.mediaIds.map(asId) : []), asId(heroData.backgroundMediaId), asId(heroData.posterMediaId)]
    .filter((value): value is string => typeof value === "string" && ObjectId.isValid(value))
    .map((value) => new ObjectId(value));
  const db = mediaIds.length ? await getDb() : null;
  const media = db ? await db.collection(collections.mediaAssets).find({
    _id: { $in: mediaIds }, visibility: "public", status: { $in: ["ready", "published"] },
  }).toArray() : [];
  const mediaById = new Map(media.map((item) => [asId(item._id), item]));

  return {
    hero: heroSection ? {
      ...heroSection,
      data: {
        ...heroData,
        backgroundUrl: mediaById.get(asString(heroData.backgroundMediaId))?.publicUrl ?? heroData.backgroundUrl,
        posterUrl: mediaById.get(asString(heroData.posterMediaId))?.publicUrl ?? heroData.posterUrl,
      },
    } : null,
    intro: introSection ?? null,
    sections: allSections.map((section) => ({
      ...section,
      resolvedMediaUrls: Array.isArray(section.mediaIds)
        ? section.mediaIds.map((id) => mediaById.get(asId(id))?.publicUrl).filter(Boolean)
        : [],
    })),
    fallback: fallbackContent,
  };
}
