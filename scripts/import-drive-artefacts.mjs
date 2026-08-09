import { createReadStream, promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { S3Client, PutObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import { MongoClient, ObjectId } from "mongodb";

const root = path.resolve(".tmp-drive-selected");
const bucket = process.env.R2_BUCKET_NAME;
const baseUrl = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
const prefix = (process.env.R2_OBJECT_PREFIX || "dev").replace(/^\/+|\/+$/g, "");
if (!bucket || !baseUrl || !process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.MONGODB_URI) throw new Error("R2 or MongoDB environment is incomplete.");

const endpoint = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
const serverDate = new Date((await fetch(endpoint, { method: "HEAD" })).headers.get("date") || Date.now()).getTime();
const systemClockOffset = serverDate - Date.now();
const s3 = new S3Client({ region: "auto", endpoint, systemClockOffset, credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY } });
const mongo = new MongoClient(process.env.MONGODB_URI); await mongo.connect();
const db = mongo.db(process.env.MONGODB_DB || "meroestream");
const media = db.collection("media_assets");

const assets = [
  ["Ticket to Life/Ticket To Life Poster.png", "image", "Ticket to Life poster"],
  ["Ticket to Life/TTL TRAILER.mp4", "video", "Ticket to Life trailer"],
  ["Ticket to Life/DSC_2275_filtered.jpg", "image", "Ticket to Life production still"],
  ["Ticket to Life/TTLSaMba.jpeg", "image", "Ticket to Life Samba still"],
  ["Ticket to Life/TTLSnaps.jpeg", "image", "Ticket to Life gallery still 1"],
  ["Ticket to Life/TTLSnaps2.jpeg", "image", "Ticket to Life gallery still 2"],
  ["Ticket to Life/TTLSnaps3.jpeg", "image", "Ticket to Life gallery still 3"],
  ["Ticket to Life/TTLSnaps4.jpeg", "image", "Ticket to Life gallery still 4"],
  ["Ticket to Life/TTLSnaps6.jpeg", "image", "Ticket to Life gallery still 6"],
  ["Double Whammy/DW Poster.png", "image", "Double Whammy poster"],
  ["Double Whammy/DW Album Cover.png", "image", "Double Whammy album cover"],
  ["Double Whammy/DW Trailer.mp4", "video", "Double Whammy trailer"],
  ["Hidden Hand/Poster 1.png", "image", "Hidden Hand With a Last Card poster"],
  ["Hidden Hand/Poster 2.png", "image", "Hidden Hand With a Last Card alternate poster"],
  ["Hidden Hand/Trailer.mp4", "video", "Hidden Hand With a Last Card trailer"],
  ["HoneyComb/HoneyComb 1.jpg", "image", "HoneyComb artwork 1"],
  ["HoneyComb/HoneyComb 2.jpg", "image", "HoneyComb artwork 2"],
  ["Behind The Scenes/PHOTO-2025-08-05-11-30-49.jpg", "image", "Hidden Hand behind the scenes cover"],
  ["Behind The Scenes/bts uncle akin lewis.mp4", "video", "Hidden Hand behind the scenes with Akin Lewis"],
  ["Stage/Palmwine drinkard.mov", "video", "The Palmwine Drinkard stage video"],
  ["Stage/IMG_3039.mov", "video", "Stage rehearsal video"],
  ["Stage/IMG_3039-cover.jpg", "image", "Stage rehearsal cover"],
  ["Brand/2-Meroe.jpeg", "image", "Mero heritage image"],
  ["Brand/Meroe-pyramids-panorama.webp", "image", "Mero pyramids panorama"],
  ["Brand/Meroe_Gold.jpeg", "image", "Mero gold brand artwork"],
];

const mime = (file) => ({ ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".mp4": "video/mp4", ".mov": "video/quicktime" }[path.extname(file).toLowerCase()] || "application/octet-stream");
const safe = (value) => value.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-|-$/g, "");
const publicUrl = (key) => `${baseUrl}/${key.split("/").map(encodeURIComponent).join("/")}`;

async function upload(file, type, title) {
  const originalName = path.basename(file);
  const existing = await media.findOne({ source: "r2", originalName, title, "metadata.driveFolderId": "1YJcHwuAvvQNeZiT4cnVm_VyTaUSNn2P3" });
  if (existing) return existing._id;
  const full = path.join(root, ...file.split("/")); const stat = await fs.stat(full);
  const key = `${prefix ? `${prefix}/` : ""}${type}s/drive-import/${safe(path.basename(file, path.extname(file)))}-${crypto.randomUUID()}${path.extname(file).toLowerCase()}`;
  const contentType = mime(file);
  if (stat.size <= 95 * 1024 * 1024) {
    await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: createReadStream(full), ContentLength: stat.size, ContentType: contentType, CacheControl: "public, max-age=31536000, immutable" }));
  } else {
    const created = await s3.send(new CreateMultipartUploadCommand({ Bucket: bucket, Key: key, ContentType: contentType, CacheControl: "public, max-age=31536000, immutable" }));
    const handle = await fs.open(full, "r"); const completed = []; const partSize = 64 * 1024 * 1024;
    try {
      for (let offset = 0, part = 1; offset < stat.size; offset += partSize, part++) {
        const length = Math.min(partSize, stat.size - offset); const body = Buffer.allocUnsafe(length); await handle.read(body, 0, length, offset);
        const result = await s3.send(new UploadPartCommand({ Bucket: bucket, Key: key, UploadId: created.UploadId, PartNumber: part, Body: body, ContentLength: length }));
        completed.push({ PartNumber: part, ETag: result.ETag });
      }
    } finally { await handle.close(); }
    await s3.send(new CompleteMultipartUploadCommand({ Bucket: bucket, Key: key, UploadId: created.UploadId, MultipartUpload: { Parts: completed } }));
  }
  const now = new Date(); const record = { title, slug: `${safe(title)}-${new ObjectId().toHexString().slice(-6)}`, mediaType: type, source: "r2", publicUrl: publicUrl(key), originalName, mimeType: contentType, size: stat.size, r2Key: key, r2Bucket: bucket, visibility: "public", allowDownload: false, status: "ready", featured: false, sortOrder: 0, metadata: { driveFolderId: "1YJcHwuAvvQNeZiT4cnVm_VyTaUSNn2P3", drivePath: file }, createdAt: now, updatedAt: now };
  const result = await media.insertOne(record); console.log(`Uploaded ${file}`); return result.insertedId;
}

const ids = new Map();
try {
  for (const asset of assets) ids.set(asset[0], await upload(...asset));
  const ticketGallery = assets.filter(([file, type]) => file.startsWith("Ticket to Life/") && type === "image" && !file.includes("Poster")).map(([file]) => ids.get(file));
  await db.collection("projects").updateOne({ slug: "ticket-to-life" }, { $set: { posterMediaId: ids.get("Ticket to Life/Ticket To Life Poster.png"), coverMediaId: ids.get("Ticket to Life/Ticket To Life Poster.png"), videoMediaId: ids.get("Ticket to Life/TTL TRAILER.mp4"), galleryMediaIds: ticketGallery, updatedAt: new Date() } });
  await db.collection("projects").updateOne({ slug: "double-whammy" }, { $set: { posterMediaId: ids.get("Double Whammy/DW Poster.png"), coverMediaId: ids.get("Double Whammy/DW Poster.png"), videoMediaId: ids.get("Double Whammy/DW Trailer.mp4"), galleryMediaIds: [ids.get("Double Whammy/DW Album Cover.png")], updatedAt: new Date() } });
  await db.collection("projects").updateOne({ slug: "the-palmwine-drinkard" }, { $set: { videoMediaId: ids.get("Stage/Palmwine drinkard.mov"), updatedAt: new Date() } });
  const now = new Date();
  await db.collection("projects").deleteMany({ slug: { $in: ["the-iron-river", "iron", "kasdasd", "anansi-rising", "daughters-of-oya", "kalahari-dreaming", "the-griot-s-last-song"] } });
  await db.collection("projects").updateOne({ slug: "hidden-hand-with-a-last-card" }, { $set: { title: "Hidden Hand With a Last Card", shortDescription: "Play to win. Pray to survive.", description: "A film experiment by Babatunde Lawal, featuring Akin Lewis and an ensemble cast.", category: "Film", posterMediaId: ids.get("Hidden Hand/Poster 1.png"), coverMediaId: ids.get("Hidden Hand/Poster 1.png"), videoMediaId: ids.get("Hidden Hand/Trailer.mp4"), galleryMediaIds: [ids.get("Hidden Hand/Poster 2.png")], featured: false, director: "Babatunde Lawal", cast: ["Akin Lewis", "Damilola Oni", "Mofehintola Jebutu", "Godspower Nwogwugwu", "Desmond Jegede", "Chabod Oyejide", "Dami Deremi"], year: "2025", duration: "", location: "Nigeria", publicStatus: "Streaming", credits: ["Produced by Korede Olayinka"], status: "published", isActive: true, sortOrder: 0, updatedAt: now, publishedAt: now }, $setOnInsert: { _id: new ObjectId(), createdAt: now } }, { upsert: true });
  await db.collection("projects").updateOne({ slug: "honeycomb" }, { $set: { title: "HoneyComb", shortDescription: "Official HoneyComb artwork and production imagery.", description: "A MeroStream screen project represented by its official production artwork.", category: "Film", posterMediaId: ids.get("HoneyComb/HoneyComb 1.jpg"), coverMediaId: ids.get("HoneyComb/HoneyComb 1.jpg"), galleryMediaIds: [ids.get("HoneyComb/HoneyComb 2.jpg")], featured: false, year: "", duration: "", location: "Nigeria", publicStatus: "Upcoming", status: "published", isActive: true, sortOrder: 0, updatedAt: now, publishedAt: now }, $setOnInsert: { _id: new ObjectId(), createdAt: now } }, { upsert: true });
  await db.collection("projects").updateOne({ slug: "stage-rehearsal" }, { $set: { title: "Stage Rehearsal", shortDescription: "An ensemble rehearsal captured in the supplied stage archive.", description: "A behind-the-scenes look at movement, ensemble work, and performance development in the rehearsal room.", category: "Theatre", posterMediaId: ids.get("Stage/IMG_3039-cover.jpg"), coverMediaId: ids.get("Stage/IMG_3039-cover.jpg"), videoMediaId: ids.get("Stage/IMG_3039.mov"), galleryMediaIds: [], featured: false, year: "", duration: "", location: "Nigeria", productionDate: "In development", publicStatus: "Rehearsal", status: "published", isActive: true, sortOrder: 0, updatedAt: now, publishedAt: new Date(now.getTime() + 1000) }, $setOnInsert: { _id: new ObjectId(), createdAt: now } }, { upsert: true });
  const doublePlatforms = [{ name: "Apple Music", url: "https://geo.music.apple.com/album/double-whammy-the-soundtrack-album/1719643100?app=music" }, { name: "Amazon Music", url: "https://music.amazon.com/albums/B0CPFTMW39?ref=dm_ff_linkfire" }, { name: "Spotify", url: "https://open.spotify.com/album/1h5KSjqtX26gJiOIEJYVv3" }, { name: "iTunes", url: "https://geo.music.apple.com/album/double-whammy-the-soundtrack-album/1719643100" }, { name: "YouTube Music", url: "https://music.youtube.com/playlist?list=OLAK5uy_mHgAqdO0rPncp4gYn_XRM0BATo73P7LJc" }, { name: "Deezer", url: "https://www.deezer.com/album/519845962" }];
  const hiddenPlatforms = [{ name: "Apple Music", url: "https://music.apple.com/us/album/hidden-hands-with-a-last-card/1802945143" }, { name: "Amazon Music", url: "https://music.amazon.co.uk/albums/B0F1W74CBW" }, { name: "Spotify", url: "https://open.spotify.com/album/2nCR1a2kf67syCJ7iPETMA" }, { name: "YouTube Music", url: "https://music.youtube.com/playlist?list=OLAK5uy_lUOMukxE711R6rDzO0bPZKczBg9mkOtHI" }, { name: "Deezer", url: "https://link.deezer.com/s/33SrEab8uWtRQlbvYbZ0z" }];
  await db.collection("projects").updateOne({ slug: "double-whammy-soundtrack" }, { $set: { title: "Double Whammy: The Soundtrack Album", shortDescription: "The official Double Whammy soundtrack album.", description: "Listen to the official Double Whammy soundtrack across major streaming platforms.", category: "Music", posterMediaId: ids.get("Double Whammy/DW Album Cover.png"), coverMediaId: ids.get("Double Whammy/DW Album Cover.png"), galleryMediaIds: [], platforms: doublePlatforms, featured: false, publicStatus: "Streaming", status: "published", isActive: true, sortOrder: 0, updatedAt: now, publishedAt: now }, $setOnInsert: { _id: new ObjectId(), createdAt: now } }, { upsert: true });
  await db.collection("projects").updateOne({ slug: "hidden-hand-soundtrack" }, { $set: { title: "Hidden Hand With a Last Card: Album", shortDescription: "The official Hidden Hand With a Last Card album.", description: "Listen to the official album across major streaming platforms.", category: "Music", posterMediaId: ids.get("Hidden Hand/Poster 2.png"), coverMediaId: ids.get("Hidden Hand/Poster 2.png"), galleryMediaIds: [], platforms: hiddenPlatforms, featured: false, publicStatus: "Streaming", status: "published", isActive: true, sortOrder: 0, updatedAt: now, publishedAt: now }, $setOnInsert: { _id: new ObjectId(), createdAt: now } }, { upsert: true });
  await db.collection("bts_projects").updateOne({ slug: "ticket-to-life" }, { $set: { mediaIds: [ids.get("Ticket to Life/DSC_2275_filtered.jpg"), ids.get("Ticket to Life/TTL TRAILER.mp4")], "data.coverMediaId": ids.get("Ticket to Life/DSC_2275_filtered.jpg"), "data.videoMediaId": ids.get("Ticket to Life/TTL TRAILER.mp4"), updatedAt: new Date() } });
  await db.collection("bts_projects").updateOne({ slug: "double-whammy" }, { $set: { mediaIds: [ids.get("Double Whammy/DW Album Cover.png"), ids.get("Double Whammy/DW Trailer.mp4")], "data.coverMediaId": ids.get("Double Whammy/DW Album Cover.png"), "data.videoMediaId": ids.get("Double Whammy/DW Trailer.mp4"), updatedAt: new Date() } });
  await db.collection("bts_projects").updateOne({ slug: "hidden-hand-with-a-last-card" }, { $set: { mediaIds: [ids.get("Behind The Scenes/PHOTO-2025-08-05-11-30-49.jpg"), ids.get("Behind The Scenes/bts uncle akin lewis.mp4")], "data.coverMediaId": ids.get("Behind The Scenes/PHOTO-2025-08-05-11-30-49.jpg"), "data.videoMediaId": ids.get("Behind The Scenes/bts uncle akin lewis.mp4"), updatedAt: new Date() } });
  await db.collection("bts_projects").deleteOne({ slug: "borrowed-time" });
  await db.collection("bts_projects").updateOne({ slug: "the-palmwine-drinkard" }, { $set: { title: "The Palmwine Drinkard", description: "Stage development and rehearsal footage from The Palmwine Drinkard.", mediaIds: [ids.get("Stage/IMG_3039-cover.jpg"), ids.get("Stage/Palmwine drinkard.mov")], data: { coverMediaId: ids.get("Stage/IMG_3039-cover.jpg"), videoMediaId: ids.get("Stage/Palmwine drinkard.mov") }, status: "published", isActive: true, updatedAt: now } });
  await db.collection("bts_projects").updateOne({ slug: "stage-rehearsal" }, { $set: { title: "Stage Rehearsal", description: "Movement and ensemble work captured in the rehearsal room.", mediaIds: [ids.get("Stage/IMG_3039-cover.jpg"), ids.get("Stage/IMG_3039.mov")], data: { coverMediaId: ids.get("Stage/IMG_3039-cover.jpg"), videoMediaId: ids.get("Stage/IMG_3039.mov") }, status: "published", isActive: true, sortOrder: 0, updatedAt: now, publishedAt: new Date(now.getTime() + 1000) }, $setOnInsert: { _id: new ObjectId(), createdAt: now, slug: "stage-rehearsal" } }, { upsert: true });
  await db.collection("success_stories").deleteMany({});
  const storyRows = [
    { title: "Korede Olayinka", slug: "korede-olayinka", description: "A producer and creative collaborator whose work connects performance development with independent African screen storytelling.", role: "Producer and creative collaborator", projects: ["Hidden Hand With a Last Card", "The Palmwine Drinkard"], cover: ids.get("Behind The Scenes/PHOTO-2025-08-05-11-30-49.jpg") },
    { title: "Babatunde Lawal", slug: "babatunde-lawal", description: "The filmmaker behind Hidden Hand With a Last Card, bringing an ensemble survival story from concept to screen.", role: "Director and filmmaker", projects: ["Hidden Hand With a Last Card"], cover: ids.get("Hidden Hand/Poster 1.png") },
    { title: "Geshin Salvador", slug: "geshin-salvador", description: "Director of Ticket to Life, a character-led feature bringing comedy, pressure, and contemporary Nigerian life together.", role: "Film director", projects: ["Ticket to Life"], cover: ids.get("Ticket to Life/Ticket To Life Poster.png") },
    { title: "Akin Lewis", slug: "akin-lewis", description: "A featured performer in Hidden Hand With a Last Card, documented on set in the supplied production archive.", role: "Actor", projects: ["Hidden Hand With a Last Card"], cover: ids.get("Behind The Scenes/PHOTO-2025-08-05-11-30-49.jpg"), video: ids.get("Behind The Scenes/bts uncle akin lewis.mp4") },
  ];
  await db.collection("success_stories").insertMany(storyRows.map((story, index) => ({ title: story.title, slug: story.slug, description: story.description, mediaIds: [story.cover, story.video].filter(Boolean), data: { role: story.role, projects: story.projects, coverMediaId: story.cover, videoMediaId: story.video || null }, status: "published", isActive: true, sortOrder: index, createdAt: new Date(now.getTime() + index * 1000), updatedAt: now, publishedAt: new Date(now.getTime() + index * 1000) })));
  await db.collection("page_sections").updateOne({ page: "about", section: "header" }, { $set: { mediaIds: [ids.get("Brand/Meroe-pyramids-panorama.webp"), ids.get("Brand/Meroe_Gold.jpeg")], updatedAt: new Date() } });
  console.log("Drive artefacts attached to CMS records.");
} finally { await mongo.close(); }
