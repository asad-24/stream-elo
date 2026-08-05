import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { abortR2MultipartUpload } from "@/lib/media/r2-storage-provider";
import { getAdminUserFromRequest } from "@/lib/server/admin-auth";
import { collections, getDb } from "@/lib/server/mongodb";

export const runtime = "nodejs";

const abortSchema = z.object({
  mediaId: z.string().regex(/^[a-f\d]{24}$/i),
});

export async function POST(request: NextRequest) {
  const user = await getAdminUserFromRequest(request);
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const parsed = abortSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid abort input" }, { status: 400 });
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

  if (media.r2UploadId) {
    await abortR2MultipartUpload({
      key: media.r2Key,
      uploadId: media.r2UploadId,
    }).catch(() => undefined);
  }

  await db.collection(collections.mediaAssets).updateOne(
    { _id: new ObjectId(parsed.data.mediaId), createdBy: user._id },
    {
      $set: {
        status: "failed",
        updatedAt: new Date(),
      },
      $unset: { r2UploadId: "" },
    },
  );

  return NextResponse.json({ ok: true });
}
