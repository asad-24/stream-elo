import "server-only";

import { ObjectId, type Document } from "mongodb";
import { z } from "zod";
import { collections } from "@/lib/server/mongodb";

const slug = z.string().trim().min(1).max(220).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const id = z.string().regex(/^[a-f\d]{24}$/i);
const optionalId = id.nullish();
const publishable = {
  slug,
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
};
const base = { ...publishable, title: z.string().trim().min(1).max(240) };

const project = z.object({
  ...base,
  shortDescription: z.string().trim().max(500).default(""),
  description: z.string().trim().max(10000).default(""),
  category: z.string().trim().max(120).default("film"),
  categoryId: optionalId,
  posterMediaId: optionalId,
  coverMediaId: optionalId,
  videoMediaId: optionalId,
  galleryMediaIds: z.array(id).default([]),
  featured: z.boolean().default(false),
  director: z.string().trim().max(180).optional(),
  cast: z.array(z.string().trim().max(180)).optional(),
  year: z.string().trim().max(20).optional(),
  duration: z.string().trim().max(40).optional(),
  location: z.string().trim().max(180).optional(),
  productionDate: z.string().trim().max(80).optional(),
  publicStatus: z.string().trim().max(80).optional(),
  credits: z.array(z.string().trim().max(240)).optional(),
});

const category = z.object({
  ...publishable,
  name: z.string().trim().min(1).max(120),
  type: z.enum(["film", "documentary", "theatre", "music", "portfolio", "other"]),
  description: z.string().trim().max(1000).default(""),
});

const page = z.object({ ...publishable, name: z.string().trim().min(1).max(160), description: z.string().trim().max(500).default("") });
const pageSection = z.object({
  page: z.string().trim().min(1).max(120),
  section: z.string().trim().min(1).max(120),
  sectionType: z.string().trim().min(1).max(120),
  heading: z.string().trim().max(240).default(""),
  subheading: z.string().trim().max(500).default(""),
  body: z.string().trim().max(10000).default(""),
  mediaIds: z.array(id).default([]),
  data: z.record(z.string(), z.unknown()).default({}),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});
const generic = z.object({
  ...base,
  description: z.string().trim().max(10000).default(""),
  mediaIds: z.array(id).default([]),
  data: z.record(z.string(), z.unknown()).default({}),
});

export const cmsResources = {
  projects: { collection: collections.projects, schema: project },
  categories: { collection: collections.projectCategories, schema: category },
  pages: { collection: collections.pages, schema: page },
  "page-sections": { collection: collections.pageSections, schema: pageSection },
  "success-stories": { collection: collections.successStories, schema: generic },
  "bts-projects": { collection: collections.btsProjects, schema: generic },
  galleries: { collection: collections.galleries, schema: generic },
  statistics: { collection: collections.awardStatistics, schema: generic },
  benefits: { collection: collections.partnerBenefits, schema: generic },
} as const;

export type CmsResourceName = keyof typeof cmsResources;

export function getCmsResource(value: string) {
  return value in cmsResources ? cmsResources[value as CmsResourceName] : null;
}

function convertIds(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(convertIds);
  if (!value || typeof value !== "object" || value instanceof Date || value instanceof ObjectId) return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [
    key,
    (key.endsWith("Id") && typeof item === "string" && ObjectId.isValid(item))
      ? new ObjectId(item)
      : key.endsWith("Ids") && Array.isArray(item)
        ? item.map((entry) => typeof entry === "string" && ObjectId.isValid(entry) ? new ObjectId(entry) : entry)
        : convertIds(item),
  ]));
}

export function parseCmsInput(resource: NonNullable<ReturnType<typeof getCmsResource>>, value: unknown) {
  const parsed = resource.schema.safeParse(value);
  return parsed.success
    ? { success: true as const, data: convertIds(parsed.data) as Document }
    : { success: false as const, issues: parsed.error.flatten() };
}

export function serializeDocument(value: unknown): unknown {
  if (value instanceof ObjectId) return value.toHexString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(serializeDocument);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, serializeDocument(item)]));
  return value;
}
