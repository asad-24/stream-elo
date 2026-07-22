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
      intro="Browse, search, preview, rename, archive, delete, download, and copy media references. Full media CRUD will use MongoDB media records and Google Drive file IDs."
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
            placeholder="Search title, filename, slug, or Drive ID"
            className="min-h-11 flex-1 border border-papyrus/15 bg-obsidian px-4 text-sm text-papyrus placeholder:text-papyrus/35"
          />
          <button className="min-h-11 rounded-full bg-sahel px-5 font-label text-xs font-bold uppercase tracking-[0.16em] text-obsidian">
            Search
          </button>
        </form>
        <AdminTable
          columns={["Title", "Type", "Status", "Visibility", "Size", "Drive ID", "Updated"]}
          rows={media.rows.map((item) => [
            <div key={`${item.id}-title`}>
              <p className="text-papyrus">{item.title}</p>
              <p className="mt-1 text-xs text-papyrus/40">{item.originalName}</p>
            </div>,
            item.mediaType,
            <StatusPill key={`${item.id}-status`} value={item.status} />,
            item.visibility,
            item.sizeLabel,
            <span key={`${item.id}-drive`} className="break-all font-mono text-xs">
              {item.driveFileId || "Not linked"}
            </span>,
            item.updatedAt,
          ])}
          empty={
            <EmptyState
              title="No media records yet"
              body="Use the upload screen or import script to create Google Drive-backed media records in MongoDB."
              action={<AdminLinkButton href="/admin/media/upload">Upload media</AdminLinkButton>}
            />
          }
        />
      </AdminCard>
    </AdminPage>
  );
}
