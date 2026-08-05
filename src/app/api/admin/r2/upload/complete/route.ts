import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  completeR2MultipartUpload,
  headR2Object,
} from "@/lib/media/r2-storage-provider";
import { getAdminUserFromRequest } from "@/lib/server/admin-auth";
import { collections, getDb } from "@/lib/server/mongodb";

export const runtime = "nodejs";

const completeSchema = z.object({
  mediaId: z.string().regex(/^[a-f\d]{24}$/i),
  mode: z.enum(["single", "multipart"]),
  etag: z.string().trim().max(300).optional(),
  parts: z
    .array(
      z.object({
        partNumber: z.number().int().positive(),
        etag: z.string().trim().min(1).max(300),
      }),
    )
    .optional(),
});

export async function POST(request: NextRequest) {
  const user = await getAdminUserFromRequest(request);
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const parsed = completeSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid completion input" }, { status: 400 });
  }

  const db = await getDb();
  const media = await db.collection(collections.mediaAssets).findOne({
    _id: new ObjectId(parsed.data.mediaId),
    createdBy: user._id,
    source: "r2",
  });

  if (!media || !media.r2Key) {
    return NextResponse.json({ ok: false, error: "Media record not found" }, { status: 404 });
  }

  try {
    let etag = parsed.data.etag;

    if (parsed.data.mode === "multipart") {
      if (!media.r2UploadId || !parsed.data.parts?.length) {
        return NextResponse.json(
          { ok: false, error: "Multipart completion data is missing" },
          { status: 400 },
        );
      }

      const result = await completeR2MultipartUpload({
        key: media.r2Key,
        uploadId: media.r2UploadId,
        parts: parsed.data.parts,
      });
      etag = result.ETag ?? etag;
    }

    const head = await headR2Object(media.r2Key);
    const now = new Date();
    const result = await db.collection(collections.mediaAssets).findOneAndUpdate(
      { _id: new ObjectId(parsed.data.mediaId), createdBy: user._id },
      {
        $set: {
          size: head.ContentLength ?? media.size,
          mimeType: head.ContentType ?? media.mimeType,
          etag: (head.ETag ?? etag)?.replace(/^"|"$/g, ""),
          status: "ready",
          updatedAt: now,
        },
        $unset: {
          r2UploadId: "",
        },
      },
      { returnDocument: "after" },
    );

    return NextResponse.json({ ok: true, media: result });
  } catch (error) {
    await db.collection(collections.mediaAssets).updateOne(
      { _id: new ObjectId(parsed.data.mediaId), createdBy: user._id },
      {
        $set: {
          status: "failed",
          updatedAt: new Date(),
        },
      },
    );

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to complete R2 upload.",
      },
      { status: 502 },
    );
  }
}
