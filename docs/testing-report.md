# Testing Report

Date: 2026-07-22

## Commands Run

```bash
npm install googleapis
npm install bcryptjs
npm run lint
npm run typecheck
npm run build
```

Final results:

- `npm run lint`: passed
- `npm run typecheck`: passed
- `npm run build`: passed

Build output confirmed public pages are static and admin/media/API routes are dynamic.

## Local Route Smoke Check

Checked against the local dev server on port 3000:

```text
/ 200
/about 200
/portfolio 200
/films 200
/theatre 200
/behind-the-scenes 200
/success-stories 200
/contact 200
/admin/login 200
```

## Media Checks

Local intro images:

```text
/intro-iron-river.svg 200
/intro-ticket-life.svg 200
/intro-double-whammy.svg 200
/intro-palmwine.svg 200
```

Legacy WordPress media:

- 18 unique `https://meroestream.com/wp-content/uploads/...` URLs were found.
- All failed from this local environment with DNS resolution failure.
- These are documented in `docs/media-audit.md`.

## Build Issue Fixed

Initial production build failed because `/admin/dashboard` attempted to connect to MongoDB during prerendering.

Fix:

- Marked protected admin layout dynamic.
- Marked dashboard dynamic.
- Added safe dashboard stat fallback if MongoDB is unavailable during build.

## Not Fully Testable Yet

The following require real Google Drive credentials and seeded admin credentials:

- Google Drive connection status
- Listing Drive folders
- Importing existing Drive media
- Creating actual Drive resumable upload sessions
- Completing uploads with real Drive file IDs
- Streaming private Drive videos
- Downloading private Drive media
- Admin login with real seeded user

## NPM Audit Note

After installing `googleapis` and `bcryptjs`, `npm install` reported:

```text
3 vulnerabilities (1 moderate, 2 high)
```

This was not automatically fixed because `npm audit fix --force` can introduce breaking dependency changes. Review separately before production.
