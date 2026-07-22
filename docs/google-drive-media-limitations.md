# Google Drive Media Limitations

Google Drive is being used as file storage for Meroe Stream media. It is not a specialized video CDN.

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

The project includes a storage abstraction:

```text
src/lib/media/storage-provider.ts
src/lib/media/google-drive-storage-provider.ts
```

Future providers can implement the same interface without rewriting the complete admin panel.

Possible future providers:

- Cloudflare R2 plus CDN
- Vercel Blob
- Bunny Stream
- Mux
- Cloudflare Stream

## Recommendation

Use Google Drive for the current admin-managed media workflow, but keep high-traffic public streaming migration-ready.
