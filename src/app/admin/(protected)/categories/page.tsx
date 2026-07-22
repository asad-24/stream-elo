import { AdminPage } from "@/components/admin/admin-page";
import {
  AdminCard,
  AdminNotice,
  AdminTable,
  EmptyState,
  StatusPill,
} from "@/components/admin/admin-widgets";
import { getAdminCategoryRows } from "@/lib/server/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategoryRows();

  return (
    <AdminPage
      eyebrow="Categories"
      title="Category management"
      intro="Manage film, documentary, theatre, music, portfolio, and other content categories."
    >
      {!categories.ok ? <AdminNotice tone="warning">{categories.error}</AdminNotice> : null}
      <AdminCard title="Content categories" eyebrow={`${categories.rows.length} categories`}>
        <AdminTable
          columns={["Name", "Slug", "Type", "Active", "Source", "Updated"]}
          rows={categories.rows.map((category) => [
            category.name,
            category.slug,
            category.type,
            <StatusPill key={`${category.id}-active`} value={category.isActive} />,
            <StatusPill key={`${category.id}-source`} value={category.source} />,
            category.updatedAt,
          ])}
          empty={
            <EmptyState
              title="No categories found"
              body="Create category records to organize films, documentaries, theatre, music, and portfolio items."
            />
          }
        />
      </AdminCard>
    </AdminPage>
  );
}
