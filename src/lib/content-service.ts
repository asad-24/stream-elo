import "server-only";

import { collections, getDb } from "@/lib/server/mongodb";
import {
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

    return records.length ? records : fallbackContent.projects;
  } catch {
    return fallbackContent.projects;
  }
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
