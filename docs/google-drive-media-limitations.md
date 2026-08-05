# Google Drive Media Limitations

Google Drive was the original planned file storage for Meroe Stream media. The
active upload and public delivery provider is now Cloudflare R2; see
`docs/cloudflare-r2-media.md`.

## Practical Limitations

- Private playback requires the application to authorize and proxy requests.
- Private image, video, and download proxying may consume application hosting bandwidth.
- On Namecheap shared hosting, proxied playback and downloads may consume Namecheap bandwidth and may be sensitive to process limits.
- High public traffic can hit Google Drive quota, app hosting bandwidth, or serverless execution limits.
- Google Drive does not automatically create adaptive 360p, 720p, and 1080p renditions.
- Google Drive does not automatically provide HLS adaptive streaming.
- Video compression must happen before upload or through a separate processing workflow.
- Large 4K videos should not be used as default website hero videos.
- The implementation is intended for low-to-moderate traffic.

## Playback Notes

Public videos can be streamed through:

```text
/api/media/stream/MONGODB_MEDIA_ID
```

Private videos also use the same route, but require an authorized admin session or future user permission model.

The stream route forwards Range requests to Google Drive so seeking can work when Drive returns valid range responses.

## Downloads

Downloads use:

```text
/api/media/download/MONGODB_MEDIA_ID
```

Downloads are allowed only when:

- The media exists.
- The media is readable by the requester.
- `allowDownload` is enabled, unless the requester is an admin.

## Future CDN Migration

The project includes storage helpers:

```text
src/lib/media/storage-provider.ts
src/lib/media/google-drive-storage-provider.ts
src/lib/media/r2-storage-provider.ts
```

Google Drive routes remain useful only as legacy compatibility code for existing
Drive-backed records. New admin uploads should go to R2.

## Recommendation

Use Cloudflare R2 for the current admin-managed public media workflow. Use a
separate private bucket or signed-read design if protected media becomes a
product requirement later.
