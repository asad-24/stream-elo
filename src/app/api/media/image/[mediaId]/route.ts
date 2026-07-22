import { NextRequest } from "next/server";
import { adminSessionCookieName, getAdminUserFromToken } from "@/lib/server/admin-auth";
import { downloadFile, getFileMetadata } from "@/lib/google-drive/media-service";
import { canReadMedia, findMediaById } from "@/lib/server/media-records";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> },
) {
  const { mediaId } = await params;
  const media = await findMediaById(mediaId);

  if (!media || media.mediaType !== "image") {
    return new Response("Image not found.", { status: 404 });
  }

  const admin = await getAdminUserFromToken(
    request.cookies.get(adminSessionCookieName)?.value,
  );

  if (!canReadMedia(media, Boolean(admin))) {
    return new Response("Forbidden.", { status: 403 });
  }

  if (media.source !== "google-drive" || !media.driveFileId) {
    return new Response("Image source is not available through this route.", {
      status: 404,
    });
  }

  try {
    const [metadata, driveResponse] = await Promise.all([
      getFileMetadata(media.driveFileId),
      downloadFile(media.driveFileId),
    ]);

    if (!driveResponse.ok || !driveResponse.body) {
      return new Response("Unable to load image.", {
        status: driveResponse.status || 502,
      });
    }

    const headers = new Headers();
    headers.set("Content-Type", media.mimeType || metadata.mimeType || "image/jpeg");
    if (metadata.size) headers.set("Content-Length", metadata.size);
    if (metadata.md5Checksum) headers.set("ETag", `"${metadata.md5Checksum}"`);
    headers.set(
      "Cache-Control",
      media.visibility === "public"
        ? "public, max-age=3600, stale-while-revalidate=86400"
        : "private, no-store",
    );

    return new Response(driveResponse.body, { status: 200, headers });
  } catch {
    return new Response("Unable to load image.", { status: 502 });
  }
}
