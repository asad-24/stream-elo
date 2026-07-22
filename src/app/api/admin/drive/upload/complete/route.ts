import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getFileMetadata } from "@/lib/google-drive/media-service";
import { getAdminUserFromRequest } from "@/lib/server/admin-auth";
import { collections, getDb } from "@/lib/server/mongodb";

export const runtime = "nodejs";

const completeSchema = z.object({
  mediaId: z.string().regex(/^[a-f\d]{24}$/i),
  driveFileId: z.string().trim().min(10),
});

export async function POST(request: NextRequest) {
  const user = await getAdminUserFromRequest(request);
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const parsed = completeSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid completion input" }, { status: 400 });
  }

  const metadata = await getFileMetadata(parsed.data.driveFileId);
  const db = await getDb();
  const now = new Date();
  const result = await db.collection(collections.mediaAssets).findOneAndUpdate(
    { _id: new ObjectId(parsed.data.mediaId), createdBy: user._id },
    {
      $set: {
        driveFileId: parsed.data.driveFileId,
        driveFolderId: metadata.parents?.[0],
        originalName: metadata.name,
        mimeType: metadata.mimeType,
        size: metadata.size ? Number(metadata.size) : undefined,
        status: "ready",
        updatedAt: now,
      },
    },
    { returnDocument: "after" },
  );

  if (!result) {
    return NextResponse.json({ ok: false, error: "Media record not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, media: result });
}
