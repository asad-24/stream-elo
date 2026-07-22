# Meroe Stream Project Guide

This file explains what the project is right now, how it is built, and how to update images and videos safely.

## What This Project Is

Meroe Stream is a cinematic website for African film, documentary, theatre, music, and creative stories.

The current site includes:

- A fixed header with the brand text `meroeStream`.
- A hero section with a full-screen background video.
- An intro section with a two-image preview gallery and a `View all` popup.
- Featured work cards.
- Theatre production cards.
- Film and documentary sections.
- Portfolio filtering.
- Behind-the-scenes galleries.
- Success stories.
- Contact form pages and API routes.

The project is built with:

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- lucide-react icons
- MongoDB support for contact inquiries

## How To Run The Project

Install dependencies if needed:

```bash
npm install
```

Run the local site on port 3000:

```bash
npm run dev -- -p 3000
```

Open:

```text
http://localhost:3000
```

Check code quality:

```bash
npm run lint
npm run typecheck
```

Build for production:

```bash
npm run build
```

## Important Files

Main homepage:

```text
src/app/page.tsx
```

Global styles and design tokens:

```text
src/app/globals.css
```

Header:

```text
src/components/header.tsx
```

Intro image popup gallery:

```text
src/components/interactive/intro-gallery.tsx
```

Video popup component:

```text
src/components/interactive/video-modal.tsx
```

All main editable content:

```text
src/lib/content.ts
```

Local public images:

```text
public/
```

## Current Homepage Media

The homepage hero video is controlled in:

```text
src/lib/content.ts
```

Look for:

```ts
heroVideo: "https://meroestream.com/wp-content/uploads/2026/07/Copy-of-DW-Trailer_Drums-4K.mp4",
```

The hero fallback poster image is:

```ts
heroPoster: "https://meroestream.com/wp-content/uploads/2026/07/poster-collage-landscape-1-scaled.png",
```

The homepage uses the video here:

```text
src/app/page.tsx
```

Look for:

```tsx
<source src={asset.heroVideo} type="video/mp4" />
```

## How To Change The Hero Video

To change the hero video, replace `asset.heroVideo` in `src/lib/content.ts` with a new MP4 URL:

```ts
heroVideo: "https://example.com/my-video.mp4",
```

Use an MP4 file for the hero section. The current `<video>` tag expects:

```tsx
type="video/mp4"
```

Good hero video rules:

- Use a short compressed MP4.
- Keep it landscape, ideally 16:9.
- Keep the file size as small as possible.
- Avoid videos with important text near the edges because the video uses `object-cover`.
- Always set a poster image so the page still looks good before the video loads.

## How To Change The Hero Poster Image

Change this in `src/lib/content.ts`:

```ts
heroPoster: "https://example.com/my-poster.jpg",
```

Recommended poster image:

- Landscape
- 16:9 or wider
- JPG, PNG, or WebP
- Clear enough to look good behind dark overlays

## Current Intro Gallery

The intro section currently shows only 2 images on the page.

When the user clicks `View all`, a popup opens with all 4 images.

The section is in:

```text
src/app/page.tsx
```

Look for:

```tsx
<IntroGallery
  images={[
    {
      src: "/intro-iron-river.svg",
      alt: "The Iron River poster artwork",
    },
    {
      src: "/intro-ticket-life.svg",
      alt: "Ticket To Life poster artwork",
    },
    {
      src: "/intro-double-whammy.svg",
      alt: "Double Whammy poster artwork",
    },
    {
      src: "/intro-palmwine.svg",
      alt: "The Palmwine Drinkard poster artwork",
    },
  ]}
/>
```

The preview count is controlled inside:

```text
src/components/interactive/intro-gallery.tsx
```

Look for:

```ts
const previewImages = images.slice(0, 2);
```

That means:

- `slice(0, 2)` shows 2 images in the section.
- The popup still shows all images passed to `IntroGallery`.

To show 3 images in the section instead, change it to:

```ts
const previewImages = images.slice(0, 3);
```

To show 4 images in the section instead, change it to:

```ts
const previewImages = images.slice(0, 4);
```

## Why The Intro Gallery Uses Local Images

Some remote image URLs from `meroestream.com` did not load reliably in local development. They caused broken image boxes.

To keep the section stable, the intro gallery currently uses local images from:

```text
public/
```

Current local intro images:

```text
public/intro-iron-river.svg
public/intro-ticket-life.svg
public/intro-double-whammy.svg
public/intro-palmwine.svg
```

These files can be replaced later with real final poster images.

## How To Replace Intro Gallery Images

Option 1: replace the local files.

Keep the same filenames:

```text
public/intro-iron-river.svg
public/intro-ticket-life.svg
public/intro-double-whammy.svg
public/intro-palmwine.svg
```

You can replace them with JPG, PNG, WebP, or SVG files. If the file extension changes, update `src/app/page.tsx`.

Example:

```tsx
{
  src: "/intro-iron-river.jpg",
  alt: "The Iron River poster artwork",
}
```

Option 2: use remote URLs.

Example:

```tsx
{
  src: "https://example.com/poster.jpg",
  alt: "Poster artwork",
}
```

If using remote URLs with Next Image optimization, the domain must be allowed in:

```text
next.config.ts
```

Look for:

```ts
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "meroestream.com",
    },
  ],
},
```

If the remote host is unreliable, use local images in `public/`.

## Image Display Rules Used Now

The intro gallery image boxes use:

```tsx
className="object-cover"
```

This fills the image box and may crop edges.

Use `object-cover` when:

- You want the box to look full.
- Cropping is acceptable.
- The artwork has no important text near the edge.

Use `object-contain` when:

- You must show the full poster.
- No cropping is allowed.
- Empty space around the image is acceptable.

To change this, edit:

```text
src/components/interactive/intro-gallery.tsx
```

Look for:

```tsx
className="object-cover"
```

Change it to:

```tsx
className="object-contain"
```

## Project Cards And Videos

Project content is controlled in:

```text
src/lib/content.ts
```

Each project can have:

```ts
poster: string;
cover: string;
gallery: string[];
video?: VideoSource;
```

Example MP4 video:

```ts
video: {
  type: "mp4",
  url: asset.dwVideo,
  label: "Play excerpt",
},
```

Example YouTube video:

```ts
video: {
  type: "youtube",
  url: "https://youtu.be/example",
  label: "Watch trailer",
},
```

The video popup is rendered by:

```text
src/components/interactive/video-modal.tsx
```

The video button appears automatically when a project has a `video` field.

If a project has no `video`, no video button is shown.

## Supported Video Types

The project supports these video types:

```ts
type VideoSource =
  | { type: "youtube"; url: string; label: string }
  | { type: "mp4"; url: string; label: string }
  | { type: "hls"; url: string; label: string };
```

Use `youtube` for YouTube links.

Use `mp4` for direct `.mp4` files.

Use `hls` for `.m3u8` streaming playlists.

## Best Practice For Videos

For the hero background:

- Use direct MP4.
- Keep audio muted.
- Keep the video short and compressed.
- Use a strong poster image.

For project trailers:

- YouTube is easiest.
- MP4 is good if the file is hosted on a fast CDN.
- HLS is best for larger streaming video.

Avoid uploading large videos directly to the repo. Use a CDN or media host.

## Best Practice For Images

For stable images:

- Put final images in `public/`.
- Reference them like `/image-name.jpg`.

For remote images:

- Add the domain to `next.config.ts`.
- Make sure the URL loads directly in the browser.
- Prefer WebP, JPG, or PNG.

Recommended sizes:

- Hero poster: 1920x1080 or larger
- Poster artwork: 900x1200 or similar
- Gallery images: 1200px wide or larger
- Thumbnails: 600px wide or larger

## Current Pages

Homepage:

```text
src/app/page.tsx
```

About:

```text
src/app/about/page.tsx
```

Portfolio:

```text
src/app/portfolio/page.tsx
```

Films:

```text
src/app/films/page.tsx
```

Theatre:

```text
src/app/theatre/page.tsx
```

Behind the scenes:

```text
src/app/behind-the-scenes/page.tsx
```

Success stories:

```text
src/app/success-stories/page.tsx
```

Contact:

```text
src/app/contact/page.tsx
```

## Current Brand And Design Notes

The header brand currently displays:

```text
meroeStream
```

The hero headline was reduced from the original very large size. It now uses:

```text
text-5xl md:text-7xl lg:text-8xl
```

The normal section heading component now matches the hero's desktop size:

```text
text-5xl md:text-7xl lg:text-8xl
```

## Contact Form And Environment

The contact form posts to:

```text
POST /api/contact
```

MongoDB settings should live in:

```text
.env.local
```

Expected variables:

```bash
MONGODB_URI="mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/?retryWrites=true&w=majority"
MONGODB_DB="meroestream"
NEXT_PUBLIC_CONTACT_EMAIL="hello@meroestream.com"
```

Never commit real `.env.local` credentials.

## Simple Editing Checklist

When changing images:

1. Prefer adding the image to `public/`.
2. Reference it with a path like `/my-image.jpg`.
3. Add useful `alt` text.
4. Run `npm run lint`.
5. Check the page at `http://localhost:3000`.

When changing videos:

1. Put the video URL in `src/lib/content.ts`.
2. Use the correct type: `youtube`, `mp4`, or `hls`.
3. Test the video popup.
4. Run `npm run lint`.
5. Run `npm run typecheck`.

## Current Important Note

The local intro gallery currently uses SVG placeholder artwork so the layout is never blank. Replace those local SVG files with final client poster images when the final artwork is available.
