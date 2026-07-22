import { AdminPage } from "@/components/admin/admin-page";
import {
  AdminCard,
  AdminNotice,
  AdminTable,
  EmptyState,
  StatusPill,
} from "@/components/admin/admin-widgets";
import { getAdminPageSectionRows } from "@/lib/server/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const pages = await getAdminPageSectionRows();

  return (
    <AdminPage
      eyebrow="Pages"
      title="Page content"
      intro="Edit hero, intro gallery, featured sections, theatre sections, films, BTS, success stories, and contact details through MongoDB page content."
    >
      {!pages.ok ? <AdminNotice tone="warning">{pages.error}</AdminNotice> : null}
      <AdminCard title="Editable page sections" eyebrow={`${pages.rows.length} sections`}>
        <AdminTable
          columns={["Page", "Section", "Heading", "Active", "Source", "Updated"]}
          rows={pages.rows.map((section) => [
            section.page,
            section.section,
            section.heading,
            <StatusPill key={`${section.id}-active`} value={section.isActive} />,
            <StatusPill key={`${section.id}-source`} value={section.source} />,
            section.updatedAt,
          ])}
          empty={
            <EmptyState
              title="No page sections found"
              body="MongoDB page section records will appear here after content is added."
            />
          }
        />
      </AdminCard>
    </AdminPage>
  );
}
