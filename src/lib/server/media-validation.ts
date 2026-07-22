export const allowedImageMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
] as const;

export const allowedVideoMimeTypes = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

export function isAllowedImageMimeType(value: string) {
  return allowedImageMimeTypes.includes(value as (typeof allowedImageMimeTypes)[number]);
}

export function isAllowedVideoMimeType(value: string) {
  return allowedVideoMimeTypes.includes(value as (typeof allowedVideoMimeTypes)[number]);
}

export function sanitizeFilename(value: string) {
  return value
    .trim()
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, " ")
    .slice(0, 180);
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function maxUploadBytes(kind: "image" | "video") {
  const key = kind === "image" ? "MAX_IMAGE_UPLOAD_MB" : "MAX_VIDEO_UPLOAD_MB";
  const fallback = kind === "image" ? 20 : 5000;
  const mb = Number(process.env[key] ?? fallback);
  return Math.max(1, mb) * 1024 * 1024;
}
