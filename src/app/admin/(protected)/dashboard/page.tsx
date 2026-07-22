import { AdminPage } from "@/components/admin/admin-page";
import {
  AdminCard,
  AdminNotice,
  AdminStatGrid,
  AdminTable,
  EmptyState,
  StatusPill,
} from "@/components/admin/admin-widgets";
import { getAdminDashboardData, getAdminSettingRows } from "@/lib/server/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [dashboard, settings] = await Promise.all([
    getAdminDashboardData(),
    getAdminSettingRows(),
  ]);
  const criticalSettings = settings.filter(
    (setting) =>
      setting.key === "MongoDB" ||
      setting.key === "Admin session" ||
      setting.key === "Google auth" ||
      setting.key.includes("Drive"),
  );

  return (
    <AdminPage
      eyebrow="Dashboard"
      title="Content and media overview"
      intro="A practical control surface for projects, media, Drive status, and recent inquiries."
    >
      {!dashboard.databaseReady ? (
        <AdminNotice tone="error">MongoDB is not available: {dashboard.error}</AdminNotice>
      ) : null}
      <AdminStatGrid cards={dashboard.cards} />
      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        <AdminCard title="Google Drive" eyebrow="Storage">
          <AdminTable
            columns={["Setting", "Value", "Status"]}
            rows={criticalSettings.map((setting) => [
              setting.key,
              <span key={setting.key} className="break-all text-papyrus/65">
                {setting.value}
              </span>,
              <StatusPill key={`${setting.key}-status`} value={setting.status} />,
            ])}
            empty={<EmptyState title="No settings found" body="No Drive settings are available." />}
          />
        </AdminCard>
        <AdminCard title="Recent contact inquiries" eyebrow="Inbox">
          <div className="space-y-3">
            {dashboard.recentInquiries.length ? (
              dashboard.recentInquiries.map((item) => (
                <div key={item.id} className="border-t border-papyrus/10 pt-3">
                  <p className="text-sm text-papyrus">{item.name}</p>
                  <p className="text-xs text-papyrus/50">{item.email}</p>
                  <p className="mt-1 text-xs text-papyrus/38">{item.createdAt}</p>
                </div>
              ))
            ) : (
              <EmptyState
                title="No inquiries yet"
                body="Contact form submissions will appear here once visitors send them."
              />
            )}
          </div>
        </AdminCard>
      </div>
      <div className="mt-8">
        <AdminCard title="Recent media" eyebrow="Library">
          <AdminTable
            columns={["Title", "Type", "Status", "Visibility", "Updated"]}
            rows={dashboard.recentMedia.map((item) => [
              item.title,
              item.mediaType,
              <StatusPill key={`${item.id}-status`} value={item.status} />,
              item.visibility,
              item.updatedAt,
            ])}
            empty={
              <EmptyState
                title="No media records yet"
                body="Uploaded or imported Google Drive files will appear here."
              />
            }
          />
        </AdminCard>
      </div>
    </AdminPage>
  );
}
