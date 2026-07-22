import { NextRequest } from "next/server";
import { adminSessionCookieName, getAdminUserFromToken } from "@/lib/server/admin-auth";
import { downloadFile, getFileMetadata } from "@/lib/google-drive/media-service";
import {
  canDownloadMedia,
  findMediaById,
  safeDownloadFilename,
} from "@/lib/server/media-records";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> },
) {
  const { mediaId } = await params;
  const media = await findMediaById(mediaId);

  if (!media) {
    return new Response("Media not found.", { status: 404 });
  }

  const admin = await getAdminUserFromToken(
    request.cookies.get(adminSessionCookieName)?.value,
  );

  if (!canDownloadMedia(media, Boolean(admin))) {
    return new Response("Forbidden.", { status: 403 });
  }

  if (media.source !== "google-drive" || !media.driveFileId) {
    return new Response("Media source is not available through this route.", {
      status: 404,
    });
  }

  try {
    const [metadata, driveResponse] = await Promise.all([
      getFileMetadata(media.driveFileId),
      downloadFile(media.driveFileId),
    ]);

    if (!driveResponse.ok || !driveResponse.body) {
      return new Response("Unable to download media.", {
        status: driveResponse.status || 502,
      });
    }

    const headers = new Headers();
    headers.set("Content-Type", media.mimeType || metadata.mimeType);
    headers.set(
      "Content-Disposition",
      `attachment; filename="${safeDownloadFilename(media.originalName || metadata.name)}"`,
    );
    headers.set("Cache-Control", "private, no-store");
    if (metadata.size) headers.set("Content-Length", metadata.size);

    return new Response(driveResponse.body, { status: 200, headers });
  } catch {
    return new Response("Unable to download media.", { status: 502 });
  }
}
