import Link from "next/link";
import { ObjectId, type Document } from "mongodb";
import { AdminPage } from "@/components/admin/admin-page";
import { AdminCard, AdminLinkButton, AdminNotice, EmptyState, StatusPill } from "@/components/admin/admin-widgets";
import { PageSectionEditor } from "@/components/admin/page-section-editor";
import { InlineVideoManager } from "@/components/admin/inline-video-manager";
import { PortfolioProjectsManager } from "@/components/admin/portfolio-projects-manager";
import { getAdminMediaOptions } from "@/lib/server/admin-data";
import { serializeDocument } from "@/lib/server/cms-resources";
import { collections, getDb } from "@/lib/server/mongodb";

export const dynamic = "force-dynamic";

const pageTabs = [
  ["home", "Home"], ["about", "About"], ["portfolio", "Portfolio"],
  ["films", "Films"], ["theatre", "Theatre"], ["behind-the-scenes", "Behind the scenes"],
  ["music", "Music"],
  ["success-stories", "Success stories"], ["contact", "Contact"],
] as const;

const relatedManagers: Record<string, Array<{ label: string; href: string; detail: string }>> = {
  home: [
    { label: "Featured work", href: "/admin/projects", detail: "Edit the three featured project cards and their playable media." },
    { label: "Latest theatre", href: "/admin/content/galleries", detail: "The latest two theatre productions are shown on Home." },
    { label: "Featured films", href: "/admin/projects", detail: "The latest three published films are shown on Home." },
    { label: "Awards and statistics", href: "/admin/content/statistics", detail: "Manage selections, nominations, awards, and other totals." },
  ],
  films: [{ label: "Film records", href: "/admin/projects", detail: "Manage film artwork, director, year, running time, location, and playable video." }],
  "behind-the-scenes": [{ label: "BTS galleries", href: "/admin/content/bts-projects", detail: "Manage production images, videos, captions, and details." }],
  "success-stories": [{ label: "Success stories", href: "/admin/content/success-stories", detail: "Manage people, biographies, credits, and images." }],
};

function id(value: unknown) { return value instanceof ObjectId ? value.toHexString() : String(value ?? ""); }
function text(value: unknown) { return typeof value === "string" ? value : ""; }

export default async function AdminPagesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const requested = (await searchParams).tab ?? "home";
  const activePage = pageTabs.some(([slug]) => slug === requested) ? requested : "home";
  let documents: Document[] = [];
  let images: Awaited<ReturnType<typeof getAdminMediaOptions>> = [];
  let videos: Awaited<ReturnType<typeof getAdminMediaOptions>> = [];
  let projects: Document[] = [];
  let loadError = "";
  try {
    const db = await getDb();
    [documents, images, videos, projects] = await Promise.all([
      db.collection(collections.pageSections).find(activePage === "home" ? { page: "home", section: "hero", sectionType: "hero" } : { page: activePage }).sort({ sortOrder: 1, updatedAt: -1 }).toArray(),
      getAdminMediaOptions("image"), getAdminMediaOptions("video"),
      activePage === "portfolio" ? db.collection(collections.projects).find({}).sort({ createdAt: -1 }).toArray() : ["theatre", "music"].includes(activePage) ? db.collection(collections.projects).find({ category: { $regex: `^${activePage}$`, $options: "i" } }).sort({ createdAt: -1 }).toArray() : Promise.resolve([]),
    ]);
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unable to load page content.";
  }
  const sections = documents.map((row) => ({
    id: id(row._id), page: text(row.page), section: text(row.section), sectionType: text(row.sectionType),
    heading: text(row.heading), subheading: text(row.subheading), body: text(row.body), status: text(row.status) || "draft",
    sortOrder: Number(row.sortOrder ?? 0), isActive: row.isActive !== false,
    mediaIds: Array.isArray(row.mediaIds) ? row.mediaIds.map(id) : [],
    data: row.data && typeof row.data === "object" ? row.data as Record<string, unknown> : {},
  }));
  const label = pageTabs.find(([slug]) => slug === activePage)?.[1] ?? "Home";
  return <AdminPage eyebrow="Page editor" title={`${label} page`} intro="Open each component to edit its copy and assigned media. Publish changes when they are ready for the public site.">
      {loadError ? <AdminNotice tone="error">{loadError}</AdminNotice> : null}
      <nav className="mb-7 flex flex-wrap gap-2" aria-label="Public page tabs">{pageTabs.map(([slug, tabLabel]) => <Link key={slug} href={`/admin/pages?tab=${slug}`} className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.12em] ${slug === activePage ? "border-sahel bg-sahel text-obsidian" : "border-papyrus/15 text-papyrus/65 hover:text-sahel"}`}>{tabLabel}</Link>)}</nav>
      <div className="mb-6 flex flex-wrap gap-3">{activePage !== "home" ? <AdminLinkButton href={`/admin/pages/new?page=${activePage}`}>Add component</AdminLinkButton> : null}<AdminLinkButton href={`/${activePage === "home" ? "" : activePage}`}>View public page</AdminLinkButton></div>
      {activePage !== "home" && relatedManagers[activePage]?.length ? <div className="mb-7 grid gap-4 md:grid-cols-2">{relatedManagers[activePage].map((item) => <AdminCard key={`${item.href}-${item.label}`} title={item.label} eyebrow="Page content"><p className="text-sm leading-6 text-papyrus/60">{item.detail}</p><Link href={item.href} className="mt-4 inline-flex text-sm text-sahel hover:underline">Manage records →</Link></AdminCard>)}</div> : null}
      {activePage === "portfolio" ? <div className="mb-7"><AdminCard title="Portfolio projects" eyebrow={`${projects.length} projects`}><PortfolioProjectsManager projects={serializeDocument(projects) as Parameters<typeof PortfolioProjectsManager>[0]["projects"]} /></AdminCard></div> : null}
      {activePage === "theatre" ? <div className="mb-7"><AdminCard title="Theatre productions" eyebrow={`${projects.length} productions`}><PortfolioProjectsManager projects={serializeDocument(projects) as Parameters<typeof PortfolioProjectsManager>[0]["projects"]} defaultCategory="theatre" /></AdminCard></div> : null}
      {activePage === "music" ? <div className="mb-7"><AdminCard title="Music projects" eyebrow={`${projects.length} releases`}><PortfolioProjectsManager projects={serializeDocument(projects) as Parameters<typeof PortfolioProjectsManager>[0]["projects"]} defaultCategory="music" /></AdminCard></div> : null}
      <AdminCard title="Page components" eyebrow={`${sections.length} components`}>
        {sections.length ? <div className="grid gap-4">{sections.map((section) => <details key={section.id} className="border border-papyrus/10 bg-black/10 p-5" open={section.section === "hero" || section.section === "header"}><summary className="cursor-pointer list-none"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-serif text-2xl text-papyrus">{section.heading || section.section}</p><p className="mt-1 text-xs uppercase tracking-[0.14em] text-papyrus/45">{section.section} · {section.sectionType}</p></div><StatusPill value={section.status} /></div></summary><div className="mt-6 grid gap-6 border-t border-papyrus/10 pt-6">{section.sectionType === "hero" ? <InlineVideoManager videos={videos.filter((video) => section.mediaIds.includes(video.id))} section={section} /> : <PageSectionEditor section={section} media={[...images, ...videos]} />}</div></details>)}</div> : activePage === "home" ? <EmptyState title="Hero component not found" body="The fixed Home hero component must exist before videos can be uploaded." /> : <EmptyState title="No components on this page" body="Add the first component, attach media, and publish it." action={<AdminLinkButton href={`/admin/pages/new?page=${activePage}`}>Add component</AdminLinkButton>} />}
      </AdminCard>
    </AdminPage>;
}
