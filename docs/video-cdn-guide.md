# Video And CDN Guide

## Tested Public MP4 Sample

Representative file:

- `Copy-of-DW-Trailer_Drums-4K.mp4`
- Content type: `video/mp4`
- Size: about 72.5 MB
- Byte-range requests: supported
- Current delivery: Hostinger CDN headers present
- Sample range test: first 1 MB returned `206`, but took about 8.3 seconds from this environment

`ffprobe` was not available locally, so codec, resolution, bitrate, and exact duration must be confirmed with `ffprobe` or MediaInfo before launch.

## Recommendation

- Use optimized 1080p MP4 for normal web playback.
- Use HLS adaptive streaming where available.
- Keep 4K assets for archival/download or high-bandwidth hero moments only.
- Serve video from Cloudflare R2 through the configured CDN custom domain, not
  from the Next.js app server.
- Use poster images for all videos.
- Muted autoplay only for the hero.
- Do not autoplay content videos.
- Use `playsInline` for mobile.
- Use controls for trailers and BTS videos.
- Lazy-load below-the-fold media.
- Do not autoplay sound.

## Supported Frontend Sources

The current video modal supports:

- YouTube embed URL
- Direct MP4 URL
- HLS URL for browsers with native HLS support
- Loading state
- Error fallback
- Mobile inline playback

## Production CDN Candidates

- Cloudflare R2 plus a custom CDN domain is the active implementation for public
  MP4 delivery.
- Vercel Blob or another object storage/CDN provider remains a possible future
  alternative.
- Cloudflare Stream, Mux, or Bunny Stream if adaptive streaming, thumbnails, and analytics become important.
- Signed URLs are not required unless protected streaming becomes part of the product scope.

## Cloudflare R2 Notes

- Browser uploads use presigned URLs against the R2 S3 API hostname.
- Public playback uses `R2_PUBLIC_BASE_URL`, for example
  `https://cdn.meroestream.com`.
- Large videos use multipart upload so failed parts can be retried without
  restarting the entire file.
