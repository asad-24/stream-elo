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
      poster: poster ?? fallback.poster,
      cover: cover ?? poster ?? fallback.cover,
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
        : fallback.video,
      gallery: gallery.length ? gallery : fallback.gallery,
      credits: Array.isArray(project.credits) ? project.credits.map(String) : fallback.credits,
    };
  });
}

export async function getHomeContent() {
  const heroSection = await getPageSectionContent("home", "hero");
  const introSection = await getPageSectionContent("home", "intro");

  return {
    hero: heroSection ?? null,
    intro: introSection ?? null,
    fallback: fallbackContent,
  };
}
