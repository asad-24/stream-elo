# Cloudflare R2 Media Setup

Cloudflare R2 is the active storage provider for admin-managed public images and
videos. The Next.js app creates short-lived presigned upload URLs through the R2
S3 API, while public pages render media from the R2 custom CDN domain.

## Required Environment

```text
MEDIA_PROVIDER="r2"
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME="meroestream-media"
R2_PUBLIC_BASE_URL="https://cdn.meroestream.com"
R2_UPLOAD_PART_SIZE_MB=64
MAX_IMAGE_UPLOAD_MB=20
MAX_VIDEO_UPLOAD_MB=5000
```

Use an R2 API token that can read/write objects for the selected bucket. Keep
the access key and secret server-side only.

## Bucket And Domain

1. Create the R2 bucket.
2. Connect a custom domain, for example `cdn.meroestream.com`.
3. Ensure the domain is HTTPS-only.
4. Configure Cloudflare Cache for the custom domain. If MP4 files are not cached
   by default, add a Cache Everything rule for the media hostname.

Presigned upload URLs use the R2 S3 API hostname:

```text
https://<account_id>.r2.cloudflarestorage.com
```

They do not use the public CDN custom domain.

## CORS

Configure bucket CORS for browser uploads and public media reads. Replace the
origins with production and preview/admin origins as needed.

```json
[
  {
    "AllowedOrigins": [
      "https://meroestream.com",
      "https://www.meroestream.com",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["GET", "HEAD", "PUT"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

`ETag` must be exposed so the browser can report uploaded multipart part ETags
back to the app for completion.

## Upload Behavior

- Images use a single presigned `PUT`.
- Small videos under about 100 MB may use a single presigned `PUT`.
- Large videos use multipart upload with `R2_UPLOAD_PART_SIZE_MB` chunks.
- New objects use date-based prefixes such as `images/2026/08/...` and
  `videos/2026/08/...`.
- Completed uploads are stored in MongoDB with `source: "r2"`, `r2Key`,
  `r2Bucket`, `publicUrl`, and `etag`.

## Public Rendering

Published MongoDB projects resolve assigned poster, cover, gallery, and video
media to `publicUrl`. Public pages fall back to the existing static content when
no published CMS project or ready public R2 media exists.

The R2 bucket/custom domain is public website media. Do not upload private review
copies or restricted content to this bucket unless a signed-read or private bucket
workflow is added later.
