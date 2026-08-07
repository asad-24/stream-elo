import { ensureCmsIndexes } from "../src/lib/server/cms-models";
import { collections, getDb } from "../src/lib/server/mongodb";

type Migration = { version: number; name: string; up: () => Promise<void> };
async function main() {
const db = await getDb();
const migrations: Migration[] = [
  {
    version: 1,
    name: "create-cms-indexes",
    up: async () => {
      await ensureCmsIndexes(db);
      await Promise.all([
        db.collection(collections.pages).createIndexes([{ key: { slug: 1 }, unique: true, name: "pages_slug_unique" }, { key: { status: 1, sortOrder: 1 }, name: "pages_public_sort" }]),
        ...[collections.successStories, collections.btsProjects, collections.galleries, collections.awardStatistics, collections.partnerBenefits].map((name) => db.collection(name).createIndexes([{ key: { slug: 1 }, unique: true, name: `${name}_slug_unique` }, { key: { status: 1, sortOrder: 1 }, name: `${name}_public_sort` }])),
        db.collection(collections.galleryItems).createIndexes([{ key: { galleryId: 1, sortOrder: 1 }, name: "gallery_items_gallery_sort" }, { key: { mediaId: 1 }, name: "gallery_items_media" }]),
      ]);
    },
  },
  {
    version: 2,
    name: "normalize-publishing-fields",
    up: async () => {
      const now = new Date();
      for (const name of [collections.pages, collections.pageSections, collections.projects, collections.projectCategories, collections.successStories, collections.btsProjects, collections.galleries, collections.awardStatistics, collections.partnerBenefits]) {
        await db.collection(name).updateMany({ status: { $exists: false } }, { $set: { status: "draft", isActive: true, sortOrder: 0, updatedAt: now } });
      }
      await db.collection(collections.mediaAssets).updateMany({ updatedAt: { $exists: false } }, { $set: { updatedAt: now } });
    },
  },
];

const migrationCollection = db.collection(collections.schemaMigrations);
await migrationCollection.createIndex({ version: 1 }, { unique: true, name: "schema_migrations_version_unique" });
const applied = new Set((await migrationCollection.find({}).toArray()).map((row) => Number(row.version)));

if (process.argv.includes("--status")) {
  for (const migration of migrations) console.log(`${applied.has(migration.version) ? "applied" : "pending"} ${migration.version.toString().padStart(3, "0")} ${migration.name}`);
} else {
  for (const migration of migrations) {
    if (applied.has(migration.version)) continue;
    console.log(`Applying ${migration.version.toString().padStart(3, "0")} ${migration.name}`);
    await migration.up();
    await migrationCollection.insertOne({ version: migration.version, name: migration.name, appliedAt: new Date() });
  }
  console.log("Database migrations are up to date.");
}

}
main().catch((error) => { console.error(error); process.exit(1); });
