import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getFileMetadata } from "@/lib/google-drive/media-service";
import { getAdminUserFromRequest } from "@/lib/server/admin-auth";
import { findMediaById } from "@/lib/server/media-records";

export const runtime = "nodejs";

const statusSchema = z.object({
  mediaId: z.string().regex(/^[a-f\d]{24}$/i),
});

export async function GET(request: NextRequest) {
  const user = await getAdminUserFromRequest(request);
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const parsed = statusSchema.safeParse({
    mediaId: request.nextUrl.searchParams.get("mediaId"),
  });

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid mediaId" }, { status: 400 });
  }

  const media = await findMediaById(parsed.data.mediaId);
  if (!media) return NextResponse.json({ ok: false, error: "Media not found" }, { status: 404 });

  const driveMetadata = media.driveFileId
    ? await getFileMetadata(media.driveFileId).catch(() => null)
    : null;

  return NextResponse.json({
    ok: true,
    media,
    driveMetadata,
  });
}
