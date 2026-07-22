# Current Project Audit

Audit date: 2026-07-22

## Scope

This audit was created before major implementation changes, as required by the project instructions. The goal is to document the current Meroe Stream codebase, identify risk areas, and define the implementation order for the Google Drive media, MongoDB content, admin, and typography work.

## Current Architecture

Meroe Stream is an existing production-style Next.js application. It should be extended, not rebuilt.

Current stack:

- Next.js 16.2.10 App Router
- React 19.2.4
- TypeScript
- Tailwind CSS 4
- Framer Motion
- lucide-react
- Native MongoDB driver
- Zod validation
- App Router API route handlers

Primary public routes:

- `/`
- `/about`
- `/portfolio`
- `/films`
- `/theatre`
- `/behind-the-scenes`
- `/success-stories`
- `/contact`

Current API routes:

- `POST /api/contact`
- `GET /api/health`

No admin routes currently exist.

## Existing Reusable Code

Public UI components:

- `src/components/header.tsx`
- `src/components/footer.tsx`
- `src/components/section-heading.tsx`
- `src/components/cinematic-button.tsx`
- `src/components/film-card.tsx`
- `src/components/theatre-card.tsx`
- `src/components/status-badge.tsx`
- `src/components/sections/stats-band.tsx`
- `src/components/sections/partnership-benefits.tsx`

Interactive client components:

- `src/components/interactive/reveal.tsx`
- `src/components/interactive/video-modal.tsx`
- `src/components/interactive/portfolio-filter.tsx`
- `src/components/interactive/bts-gallery.tsx`
- `src/components/interactive/success-stories-panel.tsx`
- `src/components/interactive/contact-form.tsx`
- `src/components/interactive/animated-counter.tsx`
- `src/components/interactive/intro-gallery.tsx`

Content layer:

- `src/lib/content.ts`

Server utilities:

- `src/lib/server/mongodb.ts`
- `src/lib/server/contact-inquiries.ts`
- `src/lib/server/env.ts`

General utilities:

- `src/lib/utils.ts`

## MongoDB Status

The project uses the native MongoDB Node.js driver, not Mongoose.

Existing connection helper:

- `src/lib/server/mongodb.ts`

Existing contact inquiry repository:

- `src/lib/server/contact-inquiries.ts`

Existing active collection:

- `contact_inquiries`

Collection constants already listed for future expansion:

- `users`
- `site_settings`
- `pages`
- `page_sections`
- `project_categories`
- `projects`
- `success_stories`
- `bts_projects`
- `media_assets`
- `galleries`
- `gallery_items`
- `award_statistics`
- `partner_benefits`
- `submission_logs`

These collection names exist as constants, but CRUD helpers, schemas, indexes, admin screens, and API routes for them are not implemented yet.

## Existing Schemas And Validation

Current Zod schema:

- `contactInquirySchema` in `src/lib/server/contact-inquiries.ts`

The contact form validates:

- name
- email
- telephone
- organization
- inquiry type
- subject
- message
- consent
- honeypot website field

Missing schemas:

- Admin user schema
- Session schema
- Media schema
- Project schema
- Category schema
- Page content schema
- Site setting schema
- Upload validation schema
- Drive import validation schema

## Existing API Routes

`POST /api/contact`:

- Validates request body with Zod.
- Uses a simple in-memory IP bucket rate limiter.
- Uses a honeypot field.
- Stores inquiries in MongoDB.
- Does not send notification email yet.

`GET /api/health`:

- Pings MongoDB.
- Returns database connection status.

Missing API route groups:

- Admin authentication
- Admin CRUD
- Google Drive auth/status
- Google Drive upload
- Google Drive import
- Media image proxy
- Media video stream
- Media download
- Content publishing
- Admin audit logs

## Authentication Status

No application authentication exists yet.

Missing:

- `/admin/login`
- `/admin/logout`
- HTTP-only session cookies
- Password hashing
- Role checks
- Admin user seeding
- CSRF protection
- Admin rate limiting
- Admin layout protection

The existing `.env.example` contains `AUTH_SECRET` and `NEXTAUTH_URL`, but the application does not currently implement NextAuth or custom admin auth.

The new admin implementation should use the current native MongoDB stack and add secure server-side sessions.

## Environment Variables

Local `.env.local` contains these keys only:

- `MONGODB_DB`
- `MONGODB_URI`
- `NEXT_PUBLIC_CONTACT_EMAIL`

Current `.env.example` includes MongoDB, SMTP, CDN, and public site placeholders, but it does not yet include the full required admin and Google Drive variables from the new instructions.

Missing required placeholders:

- `SESSION_SECRET`
- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `GOOGLE_DRIVE_ROOT_FOLDER_ID`
- `GOOGLE_DRIVE_IMAGES_FOLDER_ID`
- `GOOGLE_DRIVE_VIDEOS_FOLDER_ID`
- `GOOGLE_DRIVE_DOWNLOADS_FOLDER_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `GOOGLE_SHARED_DRIVE_ID`
- `MAX_IMAGE_UPLOAD_MB`
- `MAX_VIDEO_UPLOAD_MB`
- `DRIVE_UPLOAD_CHUNK_SIZE_MB`

## Google Drive Integration Status

No Google Drive integration code currently exists.

Missing:

- File ID parser
- Drive OAuth client
- Service account support
- Drive folder listing
- Drive metadata lookup
- Drive file download/stream helpers
- Resumable upload session creation
- Drive media import script
- Same-origin image proxy route
- Video stream route with range support
- Download route
- Admin Drive connection/status UI

The project instructions provide existing Drive folders that should be used for importing existing media:

- Artefacts folder ID: `1YJcHwuAvvQNeZiT4cnVm_VyTaUSNn2P3`
- Edited videos folder ID: `1d2zIfC6a4uZNxJNOjQJOCleiN819n4Sx`

These folders cannot be validated until Google API credentials are configured.

## Current Media Sources

Media is currently a mix of:

- Local public SVG files in `public/`
- Legacy WordPress uploads from `https://meroestream.com/wp-content/uploads/...`
- YouTube URLs in project video metadata
- Remote MP4 URLs from legacy WordPress uploads

Current local intro gallery files:

- `public/intro-iron-river.svg`
- `public/intro-ticket-life.svg`
- `public/intro-double-whammy.svg`
- `public/intro-palmwine.svg`

These files exist and return `200` from the local dev server.

Current legacy WordPress URLs:

- 18 unique `https://meroestream.com/wp-content/uploads/...` references were found in `src/lib/content.ts`.

Reachability from this local environment:

- All tested legacy `meroestream.com/wp-content/uploads/...` URLs failed DNS resolution with `curl` exit code 6.
- This explains why `next/image` can produce optimizer failures locally for those URLs.
- This also means hero poster, hero video, project posters, BTS images, and success story images are at risk until imported to Google Drive or replaced with reliable local/CDN media.

## Current Image Components

Image usage currently appears in:

- `src/app/about/page.tsx`
- `src/components/film-card.tsx`
- `src/components/theatre-card.tsx`
- `src/components/interactive/portfolio-filter.tsx`
- `src/components/interactive/bts-gallery.tsx`
- `src/components/interactive/success-stories-panel.tsx`
- `src/components/interactive/intro-gallery.tsx`

Most existing components use `next/image`.

Known risk:

- `next/image` server-side optimization must fetch remote files from the app server.
- If DNS or remote access fails from the server environment, the browser receives broken optimized image responses.
- Google Drive sharing pages must not be passed directly to `next/image`.

## Current Video Components

Hero background video:

- Implemented directly in `src/app/page.tsx` with `<video>`.
- Uses `asset.heroVideo`.
- Currently points to a legacy WordPress MP4 URL.

Video modal:

- Implemented in `src/components/interactive/video-modal.tsx`.
- Supports `youtube`, `mp4`, and `hls` sources.
- Does not yet support Drive media records.
- Does not proxy private video.
- Does not implement download.

## Next.js Image Configuration

Current `next.config.ts` allows these remote image hostnames:

- `meroestream.com`
- `i.ytimg.com`
- `img.youtube.com`
- `drive.google.com`
- `lh3.googleusercontent.com`

Risks:

- `meroestream.com` is allowed without restricting `pathname` to `/wp-content/uploads/**`.
- `drive.google.com` should not be used for raw sharing-page images.
- `lh3.googleusercontent.com` may be useful for some Google-hosted thumbnails, but Drive media should move toward controlled same-origin routes.
- The config should be tightened in a later phase without breaking legitimate current assets.

## Current Typography Status

Large heading classes found:

- Homepage hero: `text-5xl md:text-7xl lg:text-8xl`
- Shared section heading: `text-5xl md:text-7xl lg:text-8xl`
- About page hero: `text-6xl md:text-8xl`
- Contact page hero: `text-6xl md:text-8xl`
- Manifesto blockquote: `text-5xl md:text-7xl`
- Final CTA heading: `text-5xl md:text-7xl`
- Stats counter: `text-7xl md:text-8xl`
- Card headings commonly use `text-4xl` or `text-4xl md:text-5xl`

The requested 10-20% reduction should be implemented through shared components where possible, then page-specific hero headings.

## Deployment Configuration Status

No Vercel, Netlify, Docker, or `.openai/hosting.json` deployment config was found in the repository.

Existing docs recommend:

- Vercel for Next.js hosting
- MongoDB Atlas for database
- Namecheap for domain and email
- CDN/object storage for large videos

The new instructions ask to use Google Drive as the main media storage. This conflicts with older docs that recommend a CDN/object storage provider for video delivery. The implementation should follow the new Google Drive instruction while documenting Google Drive limitations clearly.

## Missing Admin Functionality

Missing admin features:

- Admin login/logout
- Session management
- Role-based authorization
- Admin dashboard
- Media library
- Image upload/import
- Video upload/import
- Video download controls
- Project CRUD
- Category CRUD
- Page content editing
- Site settings
- User management
- Admin profile
- Contact inquiry review UI
- Audit logging

## Broken Or Risky Media References

Confirmed from local checks:

- All 18 legacy WordPress media URLs failed DNS resolution from this environment.
- Earlier local dev server logs showed `/_next/image` returning `500` for some `DW-Poster` legacy URLs.
- The intro gallery was moved to local SVG files to avoid blank remote image tiles.

Not yet fully audited:

- Every parent dimension
- CSS visibility/animation interactions
- Google Drive sharing-page links
- Production reachability from Vercel or Namecheap
- Exact file metadata and content type for every remote asset

These belong in Phase 2 `docs/media-audit.md`.

## Existing Local Image Status

Current local files in `public/`:

- `file.svg`
- `globe.svg`
- `next.svg`
- `vercel.svg`
- `window.svg`
- `intro-iron-river.svg`
- `intro-ticket-life.svg`
- `intro-double-whammy.svg`
- `intro-palmwine.svg`

The four intro SVG files exist and are served by the local dev server with HTTP `200`.

## Security Status

Present:

- Contact form Zod validation
- Contact form honeypot
- Basic in-memory contact route rate limit
- Security headers in `next.config.ts`
- `.env*` ignored except `.env.example`
- `*.pem` ignored

Missing:

- Admin authentication
- Session cookies
- Password hashing dependency
- CSRF strategy
- Persistent/admin rate limiting
- Role checks
- Upload MIME sniffing
- Upload size limits
- Filename sanitization helpers
- Google credential handling
- Admin audit logs
- Download logs

## Deployment Risks

Primary risks:

- Legacy `meroestream.com` media host is not reliably resolvable from the current environment.
- Remote media through `next/image` can fail server-side even if a browser can sometimes load the URL.
- Google Drive credentials and folders are not configured yet.
- Google Drive is storage, not a CDN; private media proxying can consume application hosting bandwidth.
- Admin routes must not be exposed without authentication.
- MongoDB collections and indexes for admin/content/media are not implemented yet.
- `.env.example` does not match the new required Drive/admin variables yet.
- Production build must be re-run after each major phase.

## Exact Implementation Order

1. Complete Phase 2 media reference audit in `docs/media-audit.md`.
2. Diagnose local image paths and confirm every `/...` reference maps to `public/...`.
3. Add Google Drive file ID extraction helper and tests or documented examples.
4. Update `.env.example` with admin, session, Google Drive, and upload placeholders.
5. Add Google Drive setup documentation.
6. Add Google Drive config/auth/client modules with safe missing-config behavior.
7. Add a storage provider interface and Google Drive provider implementation.
8. Add MongoDB schemas/helpers for admin users, media, projects, categories, page content, settings, and indexes.
9. Add secure admin password hashing/session utilities and first-admin seed script.
10. Add protected admin routes and basic dashboard shell.
11. Add media image proxy route.
12. Add video stream route with range support.
13. Add video download route.
14. Add Drive media import script and import report.
15. Add resumable upload APIs and admin upload UI.
16. Add media library/admin CRUD views.
17. Add project/category/page/settings admin CRUD views.
18. Add content service that reads MongoDB content with `src/lib/content.ts` fallback.
19. Gradually switch public pages to the content service without removing fallback data.
20. Reduce typography scales across shared headings and page-specific oversized headings.
21. Tighten `next.config.ts` remote image patterns.
22. Document Google Drive media limitations.
23. Run public route checks.
24. Run admin route checks.
25. Run `npm install`, `npm run lint`, `npm run typecheck`, and `npm run build`.
26. Write final testing and implementation report.

## Phase 1 Conclusion

The current public website is structurally complete and should be preserved. The main missing systems are Google Drive media infrastructure, admin authentication, admin CRUD, MongoDB content/media models, controlled media delivery routes, and final media reliability. The next step is the full Phase 2 media audit.
