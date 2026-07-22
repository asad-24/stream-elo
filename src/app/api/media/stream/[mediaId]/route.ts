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

  if (!media || media.mediaType !== "video") {
    return new Response("Video not found.", { status: 404 });
  }

  const admin = await getAdminUserFromToken(
    request.cookies.get(adminSessionCookieName)?.value,
  );

  if (!canReadMedia(media, Boolean(admin))) {
    return new Response("Forbidden.", { status: 403 });
  }

  if (media.source !== "google-drive" || !media.driveFileId) {
    return new Response("Video source is not available through this route.", {
      status: 404,
    });
  }

  try {
    const range = request.headers.get("range") ?? undefined;
    const [metadata, driveResponse] = await Promise.all([
      getFileMetadata(media.driveFileId),
      downloadFile(media.driveFileId, range),
    ]);

    if (!driveResponse.ok || !driveResponse.body) {
      return new Response("Unable to load video.", {
        status: driveResponse.status || 502,
      });
    }

    const headers = new Headers();
    headers.set("Content-Type", media.mimeType || metadata.mimeType || "video/mp4");
    headers.set("Accept-Ranges", "bytes");
    headers.set(
      "Cache-Control",
      media.visibility === "public" ? "public, max-age=3600" : "private, no-store",
    );

    for (const header of ["content-length", "content-range", "etag"]) {
      const value = driveResponse.headers.get(header);
      if (value) headers.set(header, value);
    }

    return new Response(driveResponse.body, {
      status: driveResponse.status === 206 ? 206 : 200,
      headers,
    });
  } catch {
    return new Response("Unable to load video.", { status: 502 });
  }
}
