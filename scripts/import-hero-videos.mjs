import { createReadStream, promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { S3Client, PutObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import { MongoClient, ObjectId } from "mongodb";

const folderId = "1d2zIfC6a4uZNxJNOjQJOCleiN819n4Sx";
const files = ["CDN1-4K.mp4", "CDN1BT-HD_09.mp4", "CDN1DW-4K_02.mp4", "CDN1DW-HD_08.mp4", "CDN1TT-HD_05.mp4", "CDN1TT-HD_06.mp4"];
const root = path.resolve(".tmp-hero-videos");
const bucket = process.env.R2_BUCKET_NAME; const baseUrl = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
if (!bucket || !baseUrl || !process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.MONGODB_URI) throw new Error("R2 or MongoDB environment is incomplete.");
const endpoint = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
const serverDate = new Date((await fetch(endpoint, { method: "HEAD" })).headers.get("date") || Date.now()).getTime();
const s3 = new S3Client({ region: "auto", endpoint, systemClockOffset: serverDate - Date.now(), credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY } });
const mongo = new MongoClient(process.env.MONGODB_URI); await mongo.connect(); const db = mongo.db(process.env.MONGODB_DB || "meroestream"); const media = db.collection("media_assets");
const prefix = (process.env.R2_OBJECT_PREFIX || "dev").replace(/^\/+|\/+$/g, "");
const safe = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const urlFor = (key) => `${baseUrl}/${key.split("/").map(encodeURIComponent).join("/")}`;

async function upload(name, index) {
  const existing = await media.findOne({ source: "r2", originalName: name, "metadata.driveFolderId": folderId }); if (existing) return existing;
  const full = path.join(root, name); const stat = await fs.stat(full); const key = `${prefix ? `${prefix}/` : ""}videos/hero/${safe(path.basename(name, ".mp4"))}-${crypto.randomUUID()}.mp4`;
  if (stat.size <= 95 * 1024 * 1024) await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: createReadStream(full), ContentLength: stat.size, ContentType: "video/mp4", CacheControl: "public, max-age=31536000, immutable" }));
  else {
    const started = await s3.send(new CreateMultipartUploadCommand({ Bucket: bucket, Key: key, ContentType: "video/mp4", CacheControl: "public, max-age=31536000, immutable" })); const handle = await fs.open(full, "r"); const parts = []; const partSize = 64 * 1024 * 1024;
    try { for (let offset = 0, part = 1; offset < stat.size; offset += partSize, part++) { const length = Math.min(partSize, stat.size - offset); const body = Buffer.allocUnsafe(length); await handle.read(body, 0, length, offset); const result = await s3.send(new UploadPartCommand({ Bucket: bucket, Key: key, UploadId: started.UploadId, PartNumber: part, Body: body, ContentLength: length })); parts.push({ PartNumber: part, ETag: result.ETag }); } } finally { await handle.close(); }
    await s3.send(new CompleteMultipartUploadCommand({ Bucket: bucket, Key: key, UploadId: started.UploadId, MultipartUpload: { Parts: parts } }));
  }
  const now = new Date(); const record = { title: `Hero video ${index + 1}`, slug: `hero-video-${index + 1}-${new ObjectId().toHexString().slice(-6)}`, mediaType: "video", source: "r2", publicUrl: urlFor(key), originalName: name, mimeType: "video/mp4", size: stat.size, r2Key: key, r2Bucket: bucket, visibility: "public", allowDownload: false, status: "ready", featured: true, sortOrder: index, metadata: { driveFolderId: folderId }, createdAt: now, updatedAt: now }; const inserted = await media.insertOne(record); console.log(`Uploaded ${name}`); return { ...record, _id: inserted.insertedId };
}

try {
  const uploaded = []; for (let index = 0; index < files.length; index++) uploaded.push(await upload(files[index], index));
  const ids = uploaded.map((item) => item._id); const first = uploaded[0];
  const result = await db.collection("page_sections").updateOne({ page: "home", section: "hero", sectionType: "hero" }, { $set: { mediaIds: ids, "data.displayMode": "video", "data.backgroundMediaId": first._id, "data.backgroundUrl": first.publicUrl, status: "published", isActive: true, updatedAt: new Date() } });
  if (!result.matchedCount) throw new Error("Home Hero component was not found.");
  console.log(`Hero playlist replaced with ${ids.length} videos.`);
} finally { await mongo.close(); }
