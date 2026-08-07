import { asset, btsProjects, contact, navigation, partnershipBenefits, projects, stats, successStories, theatreProductions } from "../src/lib/content";
import { collections, getDb } from "../src/lib/server/mongodb";

async function main() {
const db = await getDb();
const now = new Date();
const published = { status: "published", isActive: true, publishedAt: now, updatedAt: now };
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const upsert = (collection: string, key: Record<string, unknown>, value: Record<string, unknown>) => db.collection(collection).updateOne(key, { $setOnInsert: { ...value, createdAt: now } }, { upsert: true });

for (const [sortOrder, slug] of ["home", "about", "portfolio", "films", "theatre", "behind-the-scenes", "success-stories", "contact"].entries()) {
  await upsert(collections.pages, { slug }, { name: slug.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" "), slug, description: "Public website page", sortOrder, ...published });
}

const sections = [
  { page: "home", section: "hero", sectionType: "hero", heading: "Africa has always told its own stories.", subheading: "Film · Documentary · Theatre", body: "Meroestream produces and curates African cinema, documentary, music, and live theatre rooted in tradition, speaking to the world.", data: { displayMode: "video", backgroundUrl: asset.heroVideo, posterUrl: asset.heroPoster, overlay: "cinematic", primaryButton: { label: "Explore Our Work", href: "/portfolio" }, secondaryButton: { label: "Partner With Us", href: "/contact" } } },
  { page: "home", section: "intro", sectionType: "intro-gallery", heading: "Stories make us human. Ours is told with an African accent.", body: "Meroestream exists to widen the frame for African storytellers across film, documentary, theatre, and performance.", data: { images: [asset.ironRiver, asset.ticketPoster, asset.dwPoster, asset.palmwine] } },
  { page: "home", section: "featured-work", sectionType: "project-list", heading: "Cinema, stage, sound, and memory", subheading: "Featured work", body: "A focused selection from the growing Meroestream slate.", data: {} },
  { page: "home", section: "theatre", sectionType: "theatre-list", heading: "Live stories with ritual force", subheading: "Theatre productions", body: "Stage work designed for bodies, music, language, and myth.", data: {} },
  { page: "home", section: "featured-films", sectionType: "project-list", heading: "On screen now", subheading: "Featured films", body: "Features, documentaries, and short films curated by the Meroestream editorial team.", data: {} },
  { page: "home", section: "manifesto", sectionType: "quote", heading: "Manifesto", body: "We do not treat African culture as texture. We treat it as source, structure, memory, and future.", data: {} },
  { page: "home", section: "partnership", sectionType: "benefit-list", heading: "Cultural weight, real reach", subheading: "Partnership", body: "Brands and institutions partner with Meroestream to support original African stories while meeting audiences with purpose.", data: {} },
  { page: "home", section: "contact-cta", sectionType: "cta", heading: "Ready to bring your story to the screen or stage?", data: { button: { label: "Start a Conversation", href: "/contact" } } },
  { page: "success-stories", section: "header", sectionType: "page-header", heading: "Talent shaped by opportunity", subheading: "Success stories", body: "A first look at performers, directors, and creative collaborators growing through the Meroestream ecosystem.", data: {} },
  { page: "portfolio", section: "header", sectionType: "page-header", heading: "A slate of screen, stage, and sound", subheading: "Portfolio", body: "Filter the Meroestream portfolio by discipline without leaving the page.", data: {} },
  { page: "films", section: "header", sectionType: "page-header", heading: "On screen now", subheading: "Featured films", body: "Cinematic film cards with artwork, metadata, and accessible trailer playback for YouTube and MP4 sources.", data: {} },
  { page: "theatre", section: "header", sectionType: "page-header", heading: "Live work with ancestral voltage", subheading: "Theatre productions", body: "Stage productions carrying myth, movement, music, and contemporary African performance language.", data: {} },
  { page: "behind-the-scenes", section: "header", sectionType: "page-header", heading: "The making is part of the story", subheading: "Behind the scenes", body: "Open galleries for production stills, rehearsal images, campaign artwork, and project details.", data: {} },
];
for (const [sortOrder, section] of sections.entries()) await upsert(collections.pageSections, { page: section.page, section: section.section }, { ...section, mediaIds: [], sortOrder, ...published });

for (const [sortOrder, project] of projects.entries()) await upsert(collections.projects, { slug: project.slug }, { ...project, title: project.title, shortDescription: project.shortSynopsis, description: project.fullSynopsis, category: project.category, publicStatus: project.status, legacyMedia: { poster: project.poster, cover: project.cover, video: project.video, gallery: project.gallery }, featured: sortOrder < 3, galleryMediaIds: [], sortOrder, ...published });
for (const [sortOrder, item] of successStories.entries()) await upsert(collections.successStories, { slug: slugify(item.name) }, { title: item.name, slug: slugify(item.name), description: item.bio, mediaIds: [], data: { role: item.role, imageUrl: item.image, projects: item.projects }, sortOrder, ...published });
for (const [sortOrder, item] of btsProjects.entries()) await upsert(collections.btsProjects, { slug: slugify(item.title) }, { title: item.title, slug: slugify(item.title), description: item.details, mediaIds: [], data: { media: item.media }, sortOrder, ...published });
for (const [sortOrder, item] of partnershipBenefits.entries()) await upsert(collections.partnerBenefits, { slug: slugify(item.title) }, { title: item.title, slug: slugify(item.title), description: item.text, mediaIds: [], data: { label: item.label }, sortOrder, ...published });
for (const [sortOrder, item] of stats.entries()) await upsert(collections.awardStatistics, { slug: slugify(item.label) }, { title: item.label, slug: slugify(item.label), description: "", mediaIds: [], data: { value: item.value, label: item.label }, sortOrder, ...published });
for (const [sortOrder, item] of theatreProductions.entries()) await upsert(collections.galleries, { slug: `theatre-${slugify(item.title)}` }, { title: item.title, slug: `theatre-${slugify(item.title)}`, description: item.description, mediaIds: [], data: item, sortOrder, ...published });
await upsert(collections.siteSettings, { key: "navigation" }, { key: "navigation", value: navigation });
await upsert(collections.siteSettings, { key: "contact" }, { key: "contact", value: contact });
console.log("CMS seed complete. Existing records were preserved.");
}
main().catch((error) => { console.error(error); process.exit(1); });
