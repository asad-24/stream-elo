import { ObjectId, type Collection, type Db, type Document } from "mongodb";
import { z } from "zod";
import { collections, getDb } from "@/lib/server/mongodb";

export const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Expected a MongoDB ObjectId string.");

const dateInput = z.union([z.date(), z.string().datetime()]).transform((value) =>
  value instanceof Date ? value : new Date(value),
);

export const adminRoleSchema = z.enum(["super-admin", "admin", "editor"]);

export const adminUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180).transform((value) => value.toLowerCase()),
  passwordHash: z.string().min(20),
  role: adminRoleSchema,
  isActive: z.boolean().default(true),
  lastLoginAt: dateInput.optional(),
  createdAt: dateInput,
  updatedAt: dateInput,
});

export const mediaSchema = z.object({
  title: z.string().trim().min(1).max(180),
  slug: z.string().trim().min(1).max(220),
  mediaType: z.enum(["image", "video"]),
  source: z.enum(["google-drive", "local", "legacy-remote"]),
  driveFileId: z.string().trim().min(10).optional(),
  driveFolderId: z.string().trim().min(10).optional(),
  originalName: z.string().trim().min(1).max(240),
  mimeType: z.string().trim().min(3).max(120),
  size: z.number().int().nonnegative().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  duration: z.number().nonnegative().optional(),
  posterMediaId: objectIdSchema.optional().transform((value) =>
    value ? new ObjectId(value) : undefined,
  ),
  altText: z.string().trim().max(240).optional(),
  caption: z.string().trim().max(500).optional(),
  visibility: z.enum(["public", "private", "admin"]).default("admin"),
  allowDownload: z.boolean().default(false),
  status: z
    .enum([
      "draft",
      "uploading",
      "processing",
      "ready",
      "published",
      "failed",
      "archived",
    ])
    .default("draft"),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  createdBy: objectIdSchema.transform((value) => new ObjectId(value)),
  createdAt: dateInput,
  updatedAt: dateInput,
});

export const projectSchema = z.object({
  title: z.string().trim().min(1).max(180),
  slug: z.string().trim().min(1).max(220),
  shortDescription: z.string().trim().max(500).optional(),
  description: z.string().trim().max(8000).optional(),
  categoryId: objectIdSchema.optional().transform((value) =>
    value ? new ObjectId(value) : undefined,
  ),
  posterMediaId: objectIdSchema.optional().transform((value) =>
    value ? new ObjectId(value) : undefined,
  ),
  coverMediaId: objectIdSchema.optional().transform((value) =>
    value ? new ObjectId(value) : undefined,
  ),
  galleryMediaIds: z
    .array(objectIdSchema.transform((value) => new ObjectId(value)))
    .default([]),
  videoMediaId: objectIdSchema.optional().transform((value) =>
    value ? new ObjectId(value) : undefined,
  ),
  featured: z.boolean().default(false),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  sortOrder: z.number().int().default(0),
  publishedAt: dateInput.optional(),
  createdAt: dateInput,
  updatedAt: dateInput,
});

export const categorySchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(160),
  type: z.enum(["film", "documentary", "theatre", "music", "portfolio", "other"]),
  description: z.string().trim().max(1000).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  createdAt: dateInput,
  updatedAt: dateInput,
});

export const pageContentSchema = z.object({
  page: z.string().trim().min(1).max(120),
  section: z.string().trim().min(1).max(120),
  heading: z.string().trim().max(240).optional(),
  subheading: z.string().trim().max(500).optional(),
  body: z.string().trim().max(10000).optional(),
  mediaIds: z
    .array(objectIdSchema.transform((value) => new ObjectId(value)))
    .optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().default(true),
  updatedAt: dateInput,
});

export const siteSettingSchema = z.object({
  key: z.string().trim().min(1).max(160),
  value: z.unknown(),
  updatedAt: dateInput,
});

export const downloadLogSchema = z.object({
  mediaId: objectIdSchema.transform((value) => new ObjectId(value)),
  userId: objectIdSchema.optional().transform((value) =>
    value ? new ObjectId(value) : undefined,
  ),
  ipHash: z.string().trim().max(180).optional(),
  userAgent: z.string().trim().max(500).optional(),
  downloadedAt: dateInput,
});

export type AdminUser = z.infer<typeof adminUserSchema>;
export type MediaAsset = z.infer<typeof mediaSchema>;
export type CmsProject = z.infer<typeof projectSchema>;
export type CmsCategory = z.infer<typeof categorySchema>;
export type PageContent = z.infer<typeof pageContentSchema>;
export type SiteSetting = z.infer<typeof siteSettingSchema>;
export type DownloadLog = z.infer<typeof downloadLogSchema>;

export async function getCollection<T extends Document>(
  name: keyof typeof collections,
): Promise<Collection<T>> {
  const db = await getDb();
  return db.collection<T>(collections[name]);
}

export async function ensureCmsIndexes(db?: Db) {
  const database = db ?? (await getDb());

  await Promise.all([
    database
      .collection(collections.users)
      .createIndexes([
        { key: { email: 1 }, unique: true, name: "users_email_unique" },
        { key: { role: 1 }, name: "users_role" },
        { key: { isActive: 1 }, name: "users_is_active" },
        { key: { createdAt: -1 }, name: "users_created_at" },
      ]),
    database
      .collection(collections.mediaAssets)
      .createIndexes([
        { key: { slug: 1 }, unique: true, name: "media_slug_unique" },
        {
          key: { driveFileId: 1 },
          unique: true,
          sparse: true,
          name: "media_drive_file_id_unique",
        },
        { key: { mediaType: 1 }, name: "media_type" },
        { key: { source: 1 }, name: "media_source" },
        { key: { status: 1 }, name: "media_status" },
        { key: { visibility: 1 }, name: "media_visibility" },
        { key: { createdAt: -1 }, name: "media_created_at" },
      ]),
    database
      .collection(collections.projects)
      .createIndexes([
        { key: { slug: 1 }, unique: true, name: "projects_slug_unique" },
        { key: { status: 1 }, name: "projects_status" },
        { key: { categoryId: 1 }, name: "projects_category" },
        { key: { featured: 1, sortOrder: 1 }, name: "projects_featured_sort" },
        { key: { createdAt: -1 }, name: "projects_created_at" },
      ]),
    database
      .collection(collections.projectCategories)
      .createIndexes([
        {
          key: { slug: 1, type: 1 },
          unique: true,
          name: "categories_slug_type_unique",
        },
        { key: { type: 1, sortOrder: 1 }, name: "categories_type_sort" },
        { key: { isActive: 1 }, name: "categories_is_active" },
      ]),
    database
      .collection(collections.pageSections)
      .createIndexes([
        {
          key: { page: 1, section: 1 },
          unique: true,
          name: "page_sections_page_section_unique",
        },
        { key: { isActive: 1 }, name: "page_sections_is_active" },
      ]),
    database
      .collection(collections.siteSettings)
      .createIndexes([
        { key: { key: 1 }, unique: true, name: "site_settings_key_unique" },
      ]),
    database
      .collection(collections.downloadLogs)
      .createIndexes([
        { key: { mediaId: 1 }, name: "download_logs_media_id" },
        { key: { downloadedAt: -1 }, name: "download_logs_downloaded_at" },
      ]),
  ]);
}
