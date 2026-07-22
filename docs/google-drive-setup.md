# Google Drive Setup

This project uses Google Drive as the primary storage location for admin-managed images and videos. Google Drive credentials must stay server-side. Do not expose refresh tokens, client secrets, service-account keys, or resumable upload credentials in public code.

## Recommended Account

Use a dedicated private Google account or Google Workspace Shared Drive for Meroe Stream media.

Recommended folder structure:

```text
Meroe Stream Media/
├── Images/
│   ├── Hero/
│   ├── Posters/
│   ├── Galleries/
│   ├── Featured/
│   ├── Behind The Scenes/
│   └── Success Stories/
├── Videos/
│   ├── Hero/
│   ├── Trailers/
│   ├── Films/
│   ├── Theatre/
│   ├── Documentaries/
│   └── Behind The Scenes/
├── Downloads/
├── Originals/
└── Archive/
```

Existing supplied folders for import:

```text
Artefacts:
https://drive.google.com/drive/folders/1YJcHwuAvvQNeZiT4cnVm_VyTaUSNn2P3

Edited videos:
https://drive.google.com/drive/folders/1d2zIfC6a4uZNxJNOjQJOCleiN819n4Sx
```

## Enable Google Drive API

1. Open Google Cloud Console.
2. Create or select a project for Meroe Stream.
3. Go to APIs and Services.
4. Enable Google Drive API.
5. Configure the OAuth consent screen if using OAuth.
6. Add only trusted users during testing if the app is still internal.

## OAuth Refresh Token Setup

Use this option for a dedicated personal Google Drive account.

1. Create OAuth 2.0 credentials.
2. Choose Web application.
3. Add local redirect URL for token generation, for example:

```text
http://localhost:3000/api/admin/google/callback
```

4. Add the production callback later when admin OAuth setup routes exist.
5. Request offline access and Drive scope:

```text
https://www.googleapis.com/auth/drive
```

6. Complete the consent flow with the dedicated media account.
7. Store the refresh token only in server environment variables.

Required environment variables:

```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_DRIVE_ROOT_FOLDER_ID=
GOOGLE_DRIVE_IMAGES_FOLDER_ID=
GOOGLE_DRIVE_VIDEOS_FOLDER_ID=
GOOGLE_DRIVE_DOWNLOADS_FOLDER_ID=
GOOGLE_DRIVE_ORIGINALS_FOLDER_ID=
```

## Service Account Setup

Use this option only when the media is in a Google Workspace Shared Drive or a folder shared with the service account.

1. Create a service account in Google Cloud Console.
2. Create a JSON key for the service account.
3. Copy only the required values into environment variables.
4. Share the Drive folder or Shared Drive with the service account email.
5. Give the service account the minimum role required for the workflow.

Required environment variables:

```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=
GOOGLE_SHARED_DRIVE_ID=
GOOGLE_DRIVE_ROOT_FOLDER_ID=
GOOGLE_DRIVE_IMAGES_FOLDER_ID=
GOOGLE_DRIVE_VIDEOS_FOLDER_ID=
GOOGLE_DRIVE_DOWNLOADS_FOLDER_ID=
GOOGLE_DRIVE_ORIGINALS_FOLDER_ID=
```

When storing a private key in `.env.local`, keep escaped newlines:

```bash
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

The application converts `\n` sequences back into real newlines server-side.

## Folder IDs

Google Drive folder URLs look like:

```text
https://drive.google.com/drive/folders/FOLDER_ID
```

Only copy the `FOLDER_ID` portion into environment variables.

Do not use folder URLs directly as media image or video sources.

## File IDs

Google Drive file URLs can look like:

```text
https://drive.google.com/file/d/FILE_ID/view
https://drive.google.com/open?id=FILE_ID
https://drive.google.com/uc?id=FILE_ID
```

The project includes `extractGoogleDriveFileId` to extract supported file IDs safely.

Folder links are not treated as file IDs.

## Production Variables

Set these in the hosting provider dashboard, not in committed code:

```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_DRIVE_ROOT_FOLDER_ID=
GOOGLE_DRIVE_IMAGES_FOLDER_ID=
GOOGLE_DRIVE_VIDEOS_FOLDER_ID=
GOOGLE_DRIVE_DOWNLOADS_FOLDER_ID=
GOOGLE_DRIVE_ORIGINALS_FOLDER_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=
GOOGLE_SHARED_DRIVE_ID=
MAX_IMAGE_UPLOAD_MB=20
MAX_VIDEO_UPLOAD_MB=5000
DRIVE_UPLOAD_CHUNK_SIZE_MB=16
```

Use either OAuth variables or service-account variables. Do not require both.

## Security Precautions

- Never commit `.env.local`.
- Never commit `client_secret.json`.
- Never commit `service-account.json`.
- Never send refresh tokens or private keys to the browser.
- Never log credential values.
- Do not store complete image or video binaries in MongoDB.
- Store Drive file IDs and metadata in MongoDB.
- Use same-origin media routes for private images and videos.
- Use role checks before upload, rename, delete, download, or private playback actions.

## Current Implementation Status

Implemented:

- Drive file ID extraction helper.
- Server-side Drive configuration helper.
- Server-side OAuth/service-account auth client creation.
- Drive media service functions for listing, metadata, streaming download, resumable upload session creation, delete, move, and rename.

Pending:

- Admin OAuth callback UI.
- Media import script.
- MongoDB media records.
- Image proxy route.
- Video stream route.
- Download route.
- Admin upload UI.
