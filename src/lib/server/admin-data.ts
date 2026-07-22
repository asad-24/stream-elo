import "server-only";

import { ObjectId, type Document, type Filter } from "mongodb";
import { getGoogleDriveConfig } from "@/lib/google-drive/config";
import { fallbackContent } from "@/lib/content-service";
import { collections, getDb } from "@/lib/server/mongodb";

export type AdminMediaRow = {
  id: string;
  title: string;
  mediaType: string;
  source: string;
  status: string;
  visibility: string;
  originalName: string;
  mimeType: string;
  sizeLabel: string;
  driveFileId: string;
  driveFolderId: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminProjectRow = {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  featured: string;
  source: "MongoDB" | "Fallback";
  updatedAt: string;
};

export type AdminCategoryRow = {
  id: string;
  name: string;
  slug: string;
  type: string;
  isActive: string;
  source: "MongoDB" | "Fallback";
  updatedAt: string;
};

export type AdminPageSectionRow = {
  id: string;
  page: string;
  section: string;
  heading: string;
  isActive: string;
  source: "MongoDB" | "Planned";
  updatedAt: string;
};

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: string;
  lastLoginAt: string;
  createdAt: string;
};

export type AdminSettingRow = {
  key: string;
  value: string;
  source: "Environment" | "MongoDB";
  status: "ready" | "missing" | "optional";
};

function asId(value: unknown) {
  if (value instanceof ObjectId) return value.toHexString();
  return value ? String(value) : "";
}

function asText(value: unknown, fallback = "Not set") {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

function asDate(value: unknown) {
  const date =
    value instanceof Date
      ? value
      : typeof value === "string" || typeof value === "number"
        ? new Date(value)
        : null;

  if (!date || Number.isNaN(date.getTime())) return "Not set";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function asBoolText(value: unknown) {
  return value === false ? "No" : "Yes";
}

function formatBytes(value: unknown) {
  const bytes = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return "Not set";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size >= 10 ? size.toFixed(0) : size.toFixed(1)} ${units[unitIndex]}`;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function serializeMedia(doc: Document): AdminMediaRow {
  return {
    id: asId(doc._id),
    title: asText(doc.title, "Untitled media"),
    mediaType: asText(doc.mediaType),
    source: asText(doc.source),
    status: asText(doc.status, "draft"),
    visibility: asText(doc.visibility, "admin"),
    originalName: asText(doc.originalName),
    mimeType: asText(doc.mimeType),
    sizeLabel: formatBytes(doc.size),
    driveFileId: asText(doc.driveFileId, ""),
    driveFolderId: asText(doc.driveFolderId, ""),
    createdAt: asDate(doc.createdAt),
    updatedAt: asDate(doc.updatedAt),
  };
}

export async function getAdminDashboardData() {
  try {
    const db = await getDb();
    const [
      totalProjects,
      publishedProjects,
      draftProjects,
      totalImages,
      totalVideos,
      failedMedia,
      totalUsers,
      recentInquiries,
      recentMedia,
    ] = await Promise.all([
      db.collection(collections.projects).countDocuments(),
      db.collection(collections.projects).countDocuments({ status: "published" }),
      db.collection(collections.projects).countDocuments({ status: "draft" }),
      db.collection(collections.mediaAssets).countDocuments({ mediaType: "image" }),
      db.collection(collections.mediaAssets).countDocuments({ mediaType: "video" }),
      db.collection(collections.mediaAssets).countDocuments({ status: "failed" }),
      db.collection(collections.users).countDocuments(),
      db.collection(collections.contactInquiries).find({}).sort({ createdAt: -1 }).limit(5).toArray(),
      db.collection(collections.mediaAssets).find({}).sort({ createdAt: -1 }).limit(5).toArray(),
    ]);

    return {
      databaseReady: true,
      error: "",
      cards: [
        { label: "Projects", value: totalProjects },
        { label: "Published", value: publishedProjects },
        { label: "Drafts", value: draftProjects },
        { label: "Images", value: totalImages },
        { label: "Videos", value: totalVideos },
        { label: "Failed media", value: failedMedia },
        { label: "Admin users", value: totalUsers },
      ],
      recentInquiries: recentInquiries.map((item) => ({
        id: asId(item._id),
        name: asText(item.name, "Unknown"),
        email: asText(item.email, ""),
        createdAt: asDate(item.createdAt),
      })),
      recentMedia: recentMedia.map(serializeMedia),
    };
  } catch (error) {
    return {
      databaseReady: false,
      error: error instanceof Error ? error.message : "MongoDB is not available.",
      cards: [
        { label: "Projects", value: 0 },
        { label: "Images", value: 0 },
        { label: "Videos", value: 0 },
        { label: "Admin users", value: 0 },
      ],
      recentInquiries: [],
      recentMedia: [],
    };
  }
}

export async function getAdminMediaRows(input?: {
  mediaType?: "image" | "video";
  query?: string;
  limit?: number;
}) {
  try {
    const filter: Filter<Document> = {};
    if (input?.mediaType) filter.mediaType = input.mediaType;
    if (input?.query?.trim()) {
      const pattern = new RegExp(escapeRegex(input.query.trim()), "i");
      filter.$or = [
        { title: pattern },
        { originalName: pattern },
        { slug: pattern },
        { driveFileId: pattern },
      ];
    }

    const db = await getDb();
    const rows = await db
      .collection(collections.mediaAssets)
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(input?.limit ?? 80)
      .toArray();

    return { ok: true, error: "", rows: rows.map(serializeMedia) };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to load media.",
      rows: [],
    };
  }
}

export async function getAdminProjectRows() {
  try {
    const db = await getDb();
    const [projectDocs, categoryDocs] = await Promise.all([
      db.collection(collections.projects).find({}).sort({ sortOrder: 1, createdAt: -1 }).limit(100).toArray(),
      db.collection(collections.projectCategories).find({}).toArray(),
    ]);
    const categories = new Map(categoryDocs.map((item) => [asId(item._id), asText(item.name)]));

    if (projectDocs.length) {
      return {
        ok: true,
        error: "",
        rows: projectDocs.map((item): AdminProjectRow => ({
          id: asId(item._id),
          title: asText(item.title, "Untitled project"),
          slug: asText(item.slug, ""),
          category: categories.get(asId(item.categoryId)) ?? "Unassigned",
          status: asText(item.status, "draft"),
          featured: asBoolText(item.featured),
          source: "MongoDB",
          updatedAt: asDate(item.updatedAt),
        })),
      };
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to load projects.",
      rows: fallbackContent.projects.map((project): AdminProjectRow => ({
        id: project.slug,
        title: project.title,
        slug: project.slug,
        category: project.category,
        status: project.status,
        featured: "No",
        source: "Fallback",
        updatedAt: "Static content",
      })),
    };
  }

  return {
    ok: true,
    error: "",
    rows: fallbackContent.projects.map((project): AdminProjectRow => ({
      id: project.slug,
      title: project.title,
      slug: project.slug,
      category: project.category,
      status: project.status,
      featured: "No",
      source: "Fallback",
      updatedAt: "Static content",
    })),
  };
}

export async function getAdminCategoryRows() {
  try {
    const db = await getDb();
    const rows = await db
      .collection(collections.projectCategories)
      .find({})
      .sort({ type: 1, sortOrder: 1, name: 1 })
      .limit(100)
      .toArray();

    if (rows.length) {
      return {
        ok: true,
        error: "",
        rows: rows.map((item): AdminCategoryRow => ({
          id: asId(item._id),
          name: asText(item.name),
          slug: asText(item.slug, ""),
          type: asText(item.type),
          isActive: asBoolText(item.isActive),
          source: "MongoDB",
          updatedAt: asDate(item.updatedAt),
        })),
      };
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to load categories.",
      rows: fallbackCategories(),
    };
  }

  return { ok: true, error: "", rows: fallbackCategories() };
}

function fallbackCategories(): AdminCategoryRow[] {
  const unique = new Map<string, AdminCategoryRow>();
  for (const project of fallbackContent.projects) {
    const slug = project.category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    unique.set(slug, {
      id: slug,
      name: project.category,
      slug,
      type: project.category.toLowerCase(),
      isActive: "Yes",
      source: "Fallback",
      updatedAt: "Static content",
    });
  }
  return Array.from(unique.values());
}

export async function getAdminPageSectionRows() {
  try {
    const db = await getDb();
    const rows = await db
      .collection(collections.pageSections)
      .find({})
      .sort({ page: 1, section: 1 })
      .limit(120)
      .toArray();

    if (rows.length) {
      return {
        ok: true,
        error: "",
        rows: rows.map((item): AdminPageSectionRow => ({
          id: asId(item._id),
          page: asText(item.page),
          section: asText(item.section),
          heading: asText(item.heading, "No heading"),
          isActive: asBoolText(item.isActive),
          source: "MongoDB",
          updatedAt: asDate(item.updatedAt),
        })),
      };
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to load page content.",
      rows: plannedPageSections(),
    };
  }

  return { ok: true, error: "", rows: plannedPageSections() };
}

function plannedPageSections(): AdminPageSectionRow[] {
  return [
    ["home", "hero", "Africa has always told its own stories."],
    ["home", "intro", "Stories make us human."],
    ["home", "featured", "Featured releases"],
    ["films", "listing", "Films"],
    ["theatre", "listing", "Theatre"],
    ["behind-the-scenes", "listing", "Behind the scenes"],
    ["contact", "details", "Contact"],
  ].map(([page, section, heading]) => ({
    id: `${page}-${section}`,
    page,
    section,
    heading,
    isActive: "Yes",
    source: "Planned",
    updatedAt: "Static content",
  }));
}

export async function getAdminUserRows() {
  try {
    const db = await getDb();
    const rows = await db
      .collection(collections.users)
      .find({})
      .sort({ role: 1, createdAt: -1 })
      .limit(100)
      .toArray();

    return {
      ok: true,
      error: "",
      rows: rows.map((item): AdminUserRow => ({
        id: asId(item._id),
        name: asText(item.name, "Unnamed admin"),
        email: asText(item.email, ""),
        role: asText(item.role),
        isActive: asBoolText(item.isActive),
        lastLoginAt: asDate(item.lastLoginAt),
        createdAt: asDate(item.createdAt),
      })),
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to load users.",
      rows: [],
    };
  }
}

export async function getAdminSettingRows() {
  const drive = getGoogleDriveConfig();
  const rows: AdminSettingRow[] = [
    {
      key: "MongoDB",
      value: process.env.MONGODB_URI ? `Database: ${process.env.MONGODB_DB ?? "meroestream"}` : "Missing MONGODB_URI",
      source: "Environment",
      status: process.env.MONGODB_URI ? "ready" : "missing",
    },
    {
      key: "Admin session",
      value: process.env.SESSION_SECRET || process.env.AUTH_SECRET ? "Configured" : "Missing SESSION_SECRET",
      source: "Environment",
      status: process.env.SESSION_SECRET || process.env.AUTH_SECRET ? "ready" : "missing",
    },
    {
      key: "Google auth",
      value:
        drive.authMode === "oauth"
          ? "OAuth refresh token"
          : drive.authMode === "service-account"
            ? "Service account"
            : "Missing client secret and refresh token",
      source: "Environment",
      status: drive.authMode === "missing" ? "missing" : "ready",
    },
    {
      key: "Drive images folder",
      value: drive.imagesFolderId ?? "Missing",
      source: "Environment",
      status: drive.imagesFolderId ? "ready" : "missing",
    },
    {
      key: "Drive videos folder",
      value: drive.videosFolderId ?? "Missing",
      source: "Environment",
      status: drive.videosFolderId ? "ready" : "missing",
    },
    {
      key: "Drive downloads folder",
      value: drive.downloadsFolderId ?? "Missing",
      source: "Environment",
      status: drive.downloadsFolderId ? "ready" : "missing",
    },
    {
      key: "Drive originals folder",
      value: drive.originalsFolderId ?? "Missing",
      source: "Environment",
      status: drive.originalsFolderId ? "ready" : "missing",
    },
    {
      key: "Image upload limit",
      value: `${process.env.MAX_IMAGE_UPLOAD_MB ?? "20"} MB`,
      source: "Environment",
      status: "ready",
    },
    {
      key: "Video upload limit",
      value: `${process.env.MAX_VIDEO_UPLOAD_MB ?? "5000"} MB`,
      source: "Environment",
      status: "ready",
    },
    {
      key: "Public site URL",
      value: process.env.NEXT_PUBLIC_SITE_URL ?? "Missing",
      source: "Environment",
      status: process.env.NEXT_PUBLIC_SITE_URL ? "ready" : "optional",
    },
    {
      key: "Contact email",
      value: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "Missing",
      source: "Environment",
      status: process.env.NEXT_PUBLIC_CONTACT_EMAIL ? "ready" : "optional",
    },
  ];

  try {
    const db = await getDb();
    const settings = await db
      .collection(collections.siteSettings)
      .find({})
      .sort({ key: 1 })
      .limit(100)
      .toArray();

    rows.push(
      ...settings.map((item): AdminSettingRow => ({
        key: asText(item.key),
        value: JSON.stringify(item.value ?? null),
        source: "MongoDB",
        status: "ready",
      })),
    );
  } catch {
    rows.push({
      key: "MongoDB settings",
      value: "Unable to read site_settings collection.",
      source: "MongoDB",
      status: "optional",
    });
  }

  return rows;
}

export function getDriveFolderOptions() {
  const drive = getGoogleDriveConfig();
  return [
    { label: "Images", value: drive.imagesFolderId ?? "", mediaType: "image" as const },
    { label: "Videos", value: drive.videosFolderId ?? "", mediaType: "video" as const },
    { label: "Downloads", value: drive.downloadsFolderId ?? "", mediaType: "video" as const },
    { label: "Originals", value: drive.originalsFolderId ?? "", mediaType: "video" as const },
  ].filter((item) => item.value);
}
