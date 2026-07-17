# Meroestream Frontend

Premium cinematic/editorial frontend for Meroestream, built with Next.js App Router, TypeScript, Tailwind CSS, reusable React components, and focused client-side interactions.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion for motion-enhanced interactive sections
- lucide-react for interface icons
- `next/font` and `next/image`

## Structure

- `src/app` contains route pages, app metadata, global loading/error/not-found states, and global CSS tokens.
- `src/components` contains reusable layout, cards, section headers, buttons, and page sections.
- `src/components/interactive` contains client components for navigation, counters, portfolio filtering, video modal, success stories, BTS lightbox, and the contact form.
- `src/lib/content.ts` is the central editable content layer for projects, people, theatre productions, media URLs, contact details, and placeholder client-confirmation data.
- `src/lib/server` contains server-only MongoDB helpers, validation, and repository code.
- `src/lib/utils.ts` contains small URL and class helpers.

## Content And Assets

The current phase uses public remote media URLs from the existing Meroestream website and supplied public asset references. Large video and image files are not copied into the repository.

## Backend And Database

The project uses the default Next.js backend model with App Router route handlers. MongoDB Atlas is accessed with the official MongoDB Node.js driver and cached server-side connection helpers.

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Required database variables:

```bash
MONGODB_URI="mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
MONGODB_DB="meroestream"
```

Do not commit `.env.local` or real Atlas credentials.

Available API routes:

- `POST /api/contact` saves contact inquiries into the `contact_inquiries` collection.
- `GET /api/health` pings MongoDB and reports whether the database is connected.

Set the final public contact email with:

```bash
NEXT_PUBLIC_CONTACT_EMAIL=hello@meroestream.com
```

Until the client confirms the final address, the content module defaults to `hello@meroestream.com` and also displays `info@meroestream.com` as an alternate.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run format
```

## Production Documentation

- `docs/production-readiness.md`
- `docs/migration-report.md`
- `docs/hosting-decision.md`
- `docs/video-cdn-guide.md`
- `docs/deployment-guide.md`
- `docs/backup-restore.md`
- `docs/admin-guide.md`
- `docs/final-delivery-report.md`

## Frontend Notes

- The contact form posts to `/api/contact` and stores validated inquiries in MongoDB Atlas. It also includes an email fallback.
- Video playback supports YouTube embeds and remote MP4 sources in an accessible modal.
- Portfolio filtering, success stories, and BTS galleries run client-side without page refreshes.
- Reduced-motion users receive minimized motion via global CSS.
- Missing final biographies, credits, exact production metadata, and final image choices are intentionally isolated in `src/lib/content.ts`.
