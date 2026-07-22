import { MongoClient, ServerApiVersion, type Db } from "mongodb";
import { assertServerEnv } from "@/lib/server/env";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "meroestream";

type MongoGlobal = typeof globalThis & {
  _meroestreamMongoClientPromise?: Promise<MongoClient>;
};

const globalForMongo = globalThis as MongoGlobal;

export function getMongoClient(): Promise<MongoClient> {
  assertServerEnv();

  if (!uri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if (!globalForMongo._meroestreamMongoClientPromise) {
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    globalForMongo._meroestreamMongoClientPromise = client.connect();
  }

  return globalForMongo._meroestreamMongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(dbName);
}

export const collections = {
  contactInquiries: "contact_inquiries",
  users: "users",
  siteSettings: "site_settings",
  pages: "pages",
  pageSections: "page_sections",
  projectCategories: "project_categories",
  projects: "projects",
  successStories: "success_stories",
  btsProjects: "bts_projects",
  mediaAssets: "media_assets",
  galleries: "galleries",
  galleryItems: "gallery_items",
  awardStatistics: "award_statistics",
  partnerBenefits: "partner_benefits",
  downloadLogs: "download_logs",
  submissionLogs: "submission_logs",
} as const;
