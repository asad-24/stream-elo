import Link from "next/link";
import { AdminPage } from "@/components/admin/admin-page";
import {
  AdminCard,
  AdminLinkButton,
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
      <div className="mb-6"><AdminLinkButton href="/admin/pages/new">Add page component</AdminLinkButton></div>
      {!pages.ok ? <AdminNotice tone="warning">{pages.error}</AdminNotice> : null}
      <AdminCard title="Editable page sections" eyebrow={`${pages.rows.length} sections`}>
        <AdminTable
          columns={["Page", "Section", "Heading", "Active", "Source", "Updated"]}
          rows={pages.rows.map((section) => [
            <Link key={`${section.id}-page`} href={`/admin/pages/${section.id}/edit`} className="text-sahel underline-offset-4 hover:underline">{section.page}</Link>,
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
