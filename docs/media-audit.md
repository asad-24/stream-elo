# Media Audit

Audit date: 2026-07-22

## Summary

This audit inventories the current image and video references in the repository before the Google Drive media/admin implementation.

Key findings:

- Runtime code currently has no Google Drive sharing-page media links.
- `next.config.ts` currently allows `drive.google.com` and `lh3.googleusercontent.com`, but raw Drive sharing links should not be used as image or video sources.
- Runtime content has 18 unique legacy `https://meroestream.com/wp-content/uploads/...` URLs.
- All 18 legacy WordPress media URLs failed local reachability testing with `curl` exit code 6, meaning DNS resolution failed from this environment.
- The intro gallery currently uses local files in `public/`, and those files exist.
- Most image components have valid fixed/aspect/min-height parent dimensions.
- The highest risk areas are legacy remote images used through `next/image` and legacy remote MP4 files used directly in `<video>`.

## Search Coverage

Searched for:

- `drive.google.com`
- `docs.google.com`
- `googleusercontent.com`
- `meroestream.com/wp-content/uploads`
- `<Image`
- `<img`
- `<video`
- `<source`
- `background-image`
- `backgroundImage`
- `heroVideo`
- `heroPoster`
- `poster`
- `cover`
- `gallery`
- `thumbnail`
- `video.url`
- `src=`

Searched file extensions:

- `.jpg`
- `.jpeg`
- `.png`
- `.webp`
- `.avif`
- `.gif`
- `.svg`
- `.mp4`
- `.webm`
- `.m3u8`
- `.mov`

## Runtime Google Drive References

No runtime Google Drive media URLs were found in `src/`.

| Source file | Component or line | Original URL or path | Media type | Source | Exists | URL returns | Access permission | Sharing page | Next config permits | Filename capitalization | Parent dimensions | Hidden by CSS/animation | Required fix | Final status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `next.config.ts` | lines 55 and 59 | `drive.google.com`, `lh3.googleusercontent.com` | config only | Google | N/A | N/A | N/A | N/A | Yes | N/A | N/A | N/A | Do not rely on raw Drive sharing URLs; add controlled media routes. | Risk documented |

## Supplied Google Drive Folders

These folder URLs were supplied in the task instructions, not found in runtime code:

| Source file | Component or line | Original URL or path | Media type | Source | Exists | URL returns | Access permission | Sharing page | Next config permits | Filename capitalization | Parent dimensions | Hidden by CSS/animation | Required fix | Final status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| User instructions | Artefacts folder | `https://drive.google.com/drive/folders/1YJcHwuAvvQNeZiT4cnVm_VyTaUSNn2P3` | folder | Drive | Unknown | Not tested | Requires Drive API credentials | Folder page, not file response | Do not use as media source | N/A | N/A | N/A | Use Drive API folder listing after auth. | Pending |
| User instructions | Edited videos folder | `https://drive.google.com/drive/folders/1d2zIfC6a4uZNxJNOjQJOCleiN819n4Sx` | folder | Drive | Unknown | Not tested | Requires Drive API credentials | Folder page, not file response | Do not use as media source | N/A | N/A | N/A | Use Drive API folder listing after auth. | Pending |

## Legacy WordPress Media References

Reachability test command used `curl -I -L --max-time 8`.

All listed legacy URLs failed from this environment with `curl` exit code 6, which indicates DNS resolution failure for `meroestream.com`.

| Source file | Component or line | Original URL or path | Media type | Source | Exists | URL returns | Access permission | Sharing page | Next config permits | Filename capitalization | Parent dimensions | Hidden by CSS/animation | Required fix | Final status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `src/lib/content.ts` | line 37 `asset.logo` | `https://meroestream.com/wp-content/uploads/2026/05/Copy_of_SVG_file-removebg-preview-1.webp` | image/webp | legacy remote | Unknown | Fails locally, DNS exit 6 | Unknown | No | Yes, broad host | Mixed case | Not currently rendered as logo in header | No | Import to Drive or replace with local/CDN file. | Broken/risky |
| `src/lib/content.ts` | lines 38-39 `asset.heroPoster` | `https://meroestream.com/wp-content/uploads/2026/07/poster-collage-landscape-1-scaled.png` | image/png | legacy remote | Unknown | Fails locally, DNS exit 6 | Unknown | No | Yes, broad host | Lowercase plus numeric suffix | Used as `<video poster>`; parent has full hero dimensions | No | Import to Drive/local and update hero poster. | Broken/risky |
| `src/lib/content.ts` | lines 40-41 `asset.collage` | `https://meroestream.com/wp-content/uploads/2026/07/merged_collage_landscape-e1783290037195.png` | image/png | legacy remote | Unknown | Fails locally, DNS exit 6 | Unknown | No | Yes, broad host | Lowercase plus numeric suffix | Used as cover/gallery fallback in multiple cards; dimensions valid where rendered | No | Import to Drive/local and replace usages through content/media service. | Broken/risky |
| `src/lib/content.ts` | lines 42-43 `asset.heroVideo` | `https://meroestream.com/wp-content/uploads/2026/07/Copy-of-DW-Trailer_Drums-4K.mp4` | video/mp4 | legacy remote | Unknown | Fails locally, DNS exit 6 | Unknown | No | N/A for video | Mixed case, includes `4K` | Hero video parent dimensions valid | No | Replace with compressed Drive/CDN media via content service; avoid 4K hero default. | Broken/risky |
| `src/lib/content.ts` | lines 44-45 `asset.dwVideo` | `https://meroestream.com/wp-content/uploads/2026/07/Copy-of-DW-Trailer_Drums-4K-1.mp4` | video/mp4 | legacy remote | Unknown | Fails locally, DNS exit 6 | Unknown | No | N/A for video | Mixed case, includes `4K` | Video modal dimensions valid | No | Import/replace with Drive media record and stream route. | Broken/risky |
| `src/lib/content.ts` | lines 46-47 `asset.ironRiver` | `https://meroestream.com/wp-content/uploads/2026/06/Meroe_Gold-scaled.jpeg` | image/jpeg | legacy remote | Unknown | Fails locally, DNS exit 6 | Unknown | No | Yes, broad host | Mixed case | Used in cards/about image; parent dimensions valid | No | Replace with local/Drive image. | Broken/risky |
| `src/lib/content.ts` | lines 48-49 `asset.ticketPoster` | `https://meroestream.com/wp-content/uploads/2026/06/Ticket-To-Life-Poster30.png` | image/png | legacy remote | Unknown | Fails locally, DNS exit 6 | Unknown | No | Yes, broad host | Mixed case | Used in cards/BTS; parent dimensions valid | No | Replace with local/Drive image. | Broken/risky |
| `src/lib/content.ts` | line 50 `asset.dwPoster` | `https://meroestream.com/wp-content/uploads/2026/06/DW-Poster-2.png` | image/png | legacy remote | Unknown | Fails locally, DNS exit 6 | Unknown | No | Yes, broad host | Mixed case | Used in cards/BTS; parent dimensions valid | No | Replace with local/Drive image. | Broken/risky |
| `src/lib/content.ts` | lines 51-52 `asset.dwPosterAlt` | `https://meroestream.com/wp-content/uploads/2026/06/DW-Poster-1.png` | image/png | legacy remote | Unknown | Fails locally, DNS exit 6 | Unknown | No | Yes, broad host | Mixed case | Used in cards/BTS; parent dimensions valid | No | Replace with local/Drive image. | Broken/risky |
| `src/lib/content.ts` | lines 53-54 `asset.palmwine` | `https://meroestream.com/wp-content/uploads/2026/06/Take-a-look-at-my-Canva-design4-1-scaled-e1783290194226.jpg` | image/jpeg | legacy remote | Unknown | Fails locally, DNS exit 6 | Unknown | No | Yes, broad host | Mixed case sentence filename | Used in cards/BTS; parent dimensions valid | No | Replace with lowercase local/Drive image. | Broken/risky |
| `src/lib/content.ts` | lines 55-56 `asset.theatreStill` | `https://meroestream.com/wp-content/uploads/2026/06/DSC_2275_filtered-scaled.jpg` | image/jpeg | legacy remote | Unknown | Fails locally, DNS exit 6 | Unknown | No | Yes, broad host | Uppercase prefix | Used in theatre/BTS; parent dimensions valid | No | Replace with lowercase local/Drive image. | Broken/risky |
| `src/lib/content.ts` | line 57 `asset.stageWide` | `https://meroestream.com/wp-content/uploads/2026/06/TTLSnaps3.jpeg` | image/jpeg | legacy remote | Unknown | Fails locally, DNS exit 6 | Unknown | No | Yes, broad host | Mixed case | Used in theatre/cards/BTS; parent dimensions valid | No | Replace with local/Drive image. | Broken/risky |
| `src/lib/content.ts` | lines 58-59 `asset.stageDetail` | `https://meroestream.com/wp-content/uploads/2026/06/TTLSaMba.jpeg` | image/jpeg | legacy remote | Unknown | Fails locally, DNS exit 6 | Unknown | No | Yes, broad host | Mixed case | Used in theatre/cards/BTS; parent dimensions valid | No | Replace with local/Drive image. | Broken/risky |
| `src/lib/content.ts` | lines 60-61 `asset.rehearsal` | `https://meroestream.com/wp-content/uploads/2026/06/PHOTO-2025-08-05-11-30-49.jpg` | image/jpeg | legacy remote | Unknown | Fails locally, DNS exit 6 | Unknown | No | Yes, broad host | Uppercase prefix | Used in theatre/BTS; parent dimensions valid | No | Replace with local/Drive image. | Broken/risky |
| `src/lib/content.ts` | line 62 `asset.portraitA` | `https://meroestream.com/wp-content/uploads/2026/06/Tony.png` | image/png | legacy remote | Unknown | Fails locally, DNS exit 6 | Unknown | No | Yes, broad host | Mixed case | Used in success stories; parent dimensions valid | No | Replace with local/Drive image. | Broken/risky |
| `src/lib/content.ts` | lines 63-64 `asset.portraitB` | `https://meroestream.com/wp-content/uploads/2026/06/DSC00541-scaled.png` | image/png | legacy remote | Unknown | Fails locally, DNS exit 6 | Unknown | No | Yes, broad host | Uppercase prefix | Used in success stories; parent dimensions valid | No | Replace with local/Drive image. | Broken/risky |
| `src/lib/content.ts` | lines 65-66 `asset.portraitC` | `https://meroestream.com/wp-content/uploads/2026/06/Take-a-look-at-my-Canva-design9.jpg` | image/jpeg | legacy remote | Unknown | Fails locally, DNS exit 6 | Unknown | No | Yes, broad host | Mixed case sentence filename | Used in success stories; parent dimensions valid | No | Replace with local/Drive image. | Broken/risky |
| `src/lib/content.ts` | lines 67-68 `asset.portraitD` | `https://meroestream.com/wp-content/uploads/2026/06/Comedy-Call1.jpeg` | image/jpeg | legacy remote | Unknown | Fails locally, DNS exit 6 | Unknown | No | Yes, broad host | Mixed case | Used in success stories; parent dimensions valid | No | Replace with local/Drive image. | Broken/risky |

## Local Runtime Image References

| Source file | Component or line | Original URL or path | Media type | Source | Exists | URL returns | Access permission | Sharing page | Next config permits | Filename capitalization | Parent dimensions | Hidden by CSS/animation | Required fix | Final status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `src/app/page.tsx` | line 75 | `/intro-iron-river.svg` | image/svg+xml | local public | Yes, `public/intro-iron-river.svg` | Local dev `200` | Public | No | N/A | Lowercase | `IntroGallery` tile uses `aspect-[3/4]` | No | Replace placeholder with final real poster when available. | Working placeholder |
| `src/app/page.tsx` | line 79 | `/intro-ticket-life.svg` | image/svg+xml | local public | Yes, `public/intro-ticket-life.svg` | Local dev `200` | Public | No | N/A | Lowercase | `IntroGallery` tile uses `aspect-[3/4]` | No | Replace placeholder with final real poster when available. | Working placeholder |
| `src/app/page.tsx` | line 83 | `/intro-double-whammy.svg` | image/svg+xml | local public | Yes, `public/intro-double-whammy.svg` | Local dev `200` | Public | No | N/A | Lowercase | `IntroGallery` tile uses `aspect-[3/4]` | No | Replace placeholder with final real poster when available. | Working placeholder |
| `src/app/page.tsx` | line 87 | `/intro-palmwine.svg` | image/svg+xml | local public | Yes, `public/intro-palmwine.svg` | Local dev `200` | Public | No | N/A | Lowercase | `IntroGallery` tile uses `aspect-[3/4]` | No | Replace placeholder with final real poster when available. | Working placeholder |

## Local Public Asset Inventory

| File | Media type | Runtime usage | Exists | Filename issue | Required fix | Final status |
| --- | --- | --- | --- | --- | --- | --- |
| `public/file.svg` | SVG | Not found in current runtime search | Yes | Lowercase | None unless unused assets should be removed later. | Available |
| `public/globe.svg` | SVG | Not found in current runtime search | Yes | Lowercase | None unless unused assets should be removed later. | Available |
| `public/next.svg` | SVG | Not found in current runtime search | Yes | Lowercase | None unless unused assets should be removed later. | Available |
| `public/vercel.svg` | SVG | Not found in current runtime search | Yes | Lowercase | None unless unused assets should be removed later. | Available |
| `public/window.svg` | SVG | Not found in current runtime search | Yes | Lowercase | None unless unused assets should be removed later. | Available |
| `public/intro-iron-river.svg` | SVG | Intro gallery | Yes | Lowercase | Replace with final real poster later. | Working placeholder |
| `public/intro-ticket-life.svg` | SVG | Intro gallery | Yes | Lowercase | Replace with final real poster later. | Working placeholder |
| `public/intro-double-whammy.svg` | SVG | Intro gallery | Yes | Lowercase | Replace with final real poster later. | Working placeholder |
| `public/intro-palmwine.svg` | SVG | Intro gallery | Yes | Lowercase | Replace with final real poster later. | Working placeholder |

## Component Media Usage

| Source file | Component or line | Media source | Media type | Parent dimensions | Hidden by CSS/animation | Required fix | Final status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `src/app/page.tsx` | hero `<video>` lines 16-26 | `asset.heroVideo`, `asset.heroPoster` | video/mp4 and poster image | Valid: absolute video inside `min-h-[92svh]` section | No | Replace legacy remote source with Drive/content-service media and optimized MP4. | Risky |
| `src/app/about/page.tsx` | `<Image src={asset.ironRiver}>` lines 33-39 | Legacy remote image | image | Valid: parent `relative min-h-[28rem]` | No | Replace with safe media image or Drive/local source. | Risky |
| `src/components/film-card.tsx` | `<Image src={film.poster}>` lines 9-16 | Project poster from content | image | Valid: parent article has `relative min-h-[34rem]` | No | Use safe image component after media model exists. | Risky for legacy posters |
| `src/components/theatre-card.tsx` | `<Image src={production.poster}>` lines 11-17 | Production poster from content | image | Valid: parent image panel has aspect/min height | No | Use safe image component after media model exists. | Risky for legacy posters |
| `src/components/interactive/portfolio-filter.tsx` | `<Image src={project.poster}>` lines 28-34 | Project poster from content | image | Valid: parent `relative aspect-[4/5]` | No | Use safe image component after media model exists. | Risky for legacy posters |
| `src/components/interactive/bts-gallery.tsx` | thumbnail `<Image src={item.src}>` lines 83-90 | BTS media from content | image | Valid: button `relative aspect-[4/5]` | Framer transition only | Use safe image component after media model exists. | Risky for legacy images |
| `src/components/interactive/bts-gallery.tsx` | lightbox `<Image src={activeMedia.src}>` lines 128-134 | BTS media from content | image | Valid: modal `relative aspect-[16/10]` | Modal appears only after click | Use safe image component or media route. | Risky for legacy images |
| `src/components/interactive/success-stories-panel.tsx` | `<Image src={active.image}>` lines 62-68 | Success story portrait from content | image | Valid: parent `relative min-h...` | Framer/content state only | Use safe image component after media model exists. | Risky for legacy portraits |
| `src/components/interactive/intro-gallery.tsx` | `<Image src={image.src}>` lines 15-23 | Local intro gallery images | image | Valid: caller tile `relative aspect-[3/4]` | Modal appears only after click | Keep local placeholders until final media import. | Working |
| `src/components/interactive/video-modal.tsx` | YouTube `<iframe src={youtubeEmbedUrl(video.url)}>` lines 92-99 | YouTube URL | video embed | Valid: `aspect-video` modal frame | Modal appears only after click | Keep; extend VideoSource with `drive` later. | Working if YouTube reachable |
| `src/components/interactive/video-modal.tsx` | `<source src={video.url}>` lines 101-115 | MP4/HLS URL | video | Valid: `aspect-video` modal frame | Modal appears only after click | Add Drive stream route support; keep MP4/HLS support. | Risky for legacy MP4 |

## Content Object References

These are not direct render sites, but they feed the components above.

| Source file | Component or line | Reference | Source | Required fix | Final status |
| --- | --- | --- | --- | --- | --- |
| `src/lib/content.ts` | lines 87-193 | `projects[].poster`, `projects[].cover`, `projects[].gallery`, `projects[].video` | hard-coded fallback content | Keep as fallback, then migrate to MongoDB content service. | Pending |
| `src/lib/content.ts` | lines 196-211 | `featuredFilms` | hard-coded fallback content | Keep as fallback, then migrate featured selection to MongoDB. | Pending |
| `src/lib/content.ts` | lines 215-260 | `theatreProductions[].poster`, `gallery` | hard-coded fallback content | Keep as fallback, then migrate to MongoDB. | Pending |
| `src/lib/content.ts` | lines 262-291 | `successStories[].image` | hard-coded fallback content | Keep as fallback, then migrate to MongoDB. | Pending |
| `src/lib/content.ts` | lines 293-337 | `btsProjects[].media[].src` | hard-coded fallback content | Keep as fallback, then migrate to MongoDB. | Pending |

## Documentation-Only Media Mentions

These are not runtime media references:

- `PROJECT_GUIDE.md` includes examples and current local intro filenames.
- `docs/video-cdn-guide.md` mentions `Copy-of-DW-Trailer_Drums-4K.mp4`.
- `docs/migration-report.md` mentions imported/reused WordPress media generally.
- `docs/current-project-audit.md` contains audit references created in Phase 1.

No code fix is required for documentation-only mentions, but docs should be updated after media import and admin implementation.

## Local Path Checks

No incorrect `/public/...` browser paths were found in runtime code.

All current runtime paths beginning with `/intro-...` map to files in `public/`.

No local filename capitalization mismatches were found for runtime intro gallery files.

No spaces or double extensions were found in current local public filenames.

## Required Fix Plan

1. Keep the working local intro gallery placeholders until real media is imported.
2. Add Google Drive file ID extraction and Drive API auth/client modules.
3. Add MongoDB `media_assets` helpers and indexes.
4. Create an importer for existing Google Drive media.
5. Import or replace each legacy `meroestream.com/wp-content/uploads/...` reference.
6. Add `/api/media/image/[mediaId]` and use it for Drive images.
7. Add `/api/media/stream/[mediaId]` for Drive videos.
8. Add `/api/media/download/[mediaId]` for permitted downloads.
9. Create `SafeMediaImage` to handle local, legacy remote, and Drive media safely.
10. Replace raw legacy content progressively through a MongoDB-backed content service with `src/lib/content.ts` fallback.
11. Tighten `next.config.ts` remote patterns after replacements are verified.

## Final Status

Phase 2 audit is complete enough to begin foundational implementation. The actual import of Google Drive files is pending credentials and Drive API setup.
