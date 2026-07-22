import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createResumableUploadSession } from "@/lib/google-drive/media-service";
import { getAdminUserFromRequest } from "@/lib/server/admin-auth";
import { collections, getDb } from "@/lib/server/mongodb";
import {
  isAllowedImageMimeType,
  isAllowedVideoMimeType,
  maxUploadBytes,
  sanitizeFilename,
  slugify,
} from "@/lib/server/media-validation";

export const runtime = "nodejs";

const initiateSchema = z.object({
  name: z.string().trim().min(1).max(180),
  mimeType: z.string().trim().min(3).max(120),
  size: z.number().int().positive(),
  mediaType: z.enum(["image", "video"]),
  folderId: z.string().trim().min(10).optional(),
});

export async function POST(request: NextRequest) {
  const user = await getAdminUserFromRequest(request);
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const parsed = initiateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid upload input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const mimeOk =
    input.mediaType === "image"
      ? isAllowedImageMimeType(input.mimeType)
      : isAllowedVideoMimeType(input.mimeType);

  if (!mimeOk) {
    return NextResponse.json({ ok: false, error: "File type is not allowed" }, { status: 400 });
  }

  if (input.size > maxUploadBytes(input.mediaType)) {
    return NextResponse.json({ ok: false, error: "File is too large" }, { status: 400 });
  }

  const safeName = sanitizeFilename(input.name);
  const now = new Date();
  const upload = await createResumableUploadSession({
    name: safeName,
    mimeType: input.mimeType,
    size: input.size,
    folderId: input.folderId,
  });

  const db = await getDb();
  const result = await db.collection(collections.mediaAssets).insertOne({
    title: safeName.replace(/\.[^.]+$/, ""),
    slug: `${slugify(safeName.replace(/\.[^.]+$/, ""))}-${new ObjectId().toString().slice(-6)}`,
    mediaType: input.mediaType,
    source: "google-drive",
    originalName: safeName,
    mimeType: input.mimeType,
    size: input.size,
    visibility: "admin",
    allowDownload: false,
    status: "uploading",
    featured: false,
    sortOrder: 0,
    createdBy: user._id,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({
    ok: true,
    mediaId: result.insertedId.toString(),
    uploadUrl: upload.uploadUrl,
  });
}
