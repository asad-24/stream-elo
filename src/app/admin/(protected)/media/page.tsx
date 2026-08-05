import { AdminPage } from "@/components/admin/admin-page";
import {
  AdminCard,
  AdminLinkButton,
  AdminNotice,
  AdminTable,
  EmptyState,
  StatusPill,
} from "@/components/admin/admin-widgets";
import { getAdminMediaRows } from "@/lib/server/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = (await searchParams).q ?? "";
  const media = await getAdminMediaRows({ query, limit: 100 });

  return (
    <AdminPage
      eyebrow="Media"
      title="Media library"
      intro="Browse, search, preview, rename, archive, delete, download, and copy media references. Active uploads use MongoDB media records and Cloudflare R2 object keys."
    >
      {!media.ok ? <AdminNotice tone="error">{media.error}</AdminNotice> : null}
      <AdminCard
        title="All media records"
        eyebrow={`${media.rows.length} shown`}
        action={<AdminLinkButton href="/admin/media/upload">Upload</AdminLinkButton>}
      >
        <form className="mb-5 flex flex-col gap-3 sm:flex-row">
          <input
            name="q"
            defaultValue={query}
            placeholder="Search title, filename, slug, or R2 key"
            className="min-h-11 flex-1 border border-papyrus/15 bg-obsidian px-4 text-sm text-papyrus placeholder:text-papyrus/35"
          />
          <button className="min-h-11 rounded-full bg-sahel px-5 font-label text-xs font-bold uppercase tracking-[0.16em] text-obsidian">
            Search
          </button>
        </form>
        <AdminTable
          columns={["Title", "Type", "Status", "Visibility", "Size", "R2 key", "Updated"]}
          rows={media.rows.map((item) => [
            <div key={`${item.id}-title`}>
              <p className="text-papyrus">{item.title}</p>
              <p className="mt-1 text-xs text-papyrus/40">{item.originalName}</p>
            </div>,
            item.mediaType,
            <StatusPill key={`${item.id}-status`} value={item.status} />,
            item.visibility,
            item.sizeLabel,
            <span key={`${item.id}-r2`} className="break-all font-mono text-xs">
              {item.r2Key || "Not linked"}
            </span>,
            item.updatedAt,
          ])}
          empty={
            <EmptyState
              title="No media records yet"
              body="Use the upload screen to create R2-backed media records in MongoDB."
              action={<AdminLinkButton href="/admin/media/upload">Upload media</AdminLinkButton>}
            />
          }
        />
      </AdminCard>
    </AdminPage>
  );
}
