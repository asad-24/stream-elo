import { redirect } from "next/navigation";
import { AdminPage } from "@/components/admin/admin-page";
import {
  AdminCard,
  AdminNotice,
  AdminTable,
  StatusPill,
} from "@/components/admin/admin-widgets";
import { canAccessAdminArea, getCurrentAdminUser } from "@/lib/server/admin-auth";
import { getAdminSettingRows } from "@/lib/server/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const user = await getCurrentAdminUser();
  if (!user || !canAccessAdminArea(user.role, "admin")) redirect("/admin/dashboard");
  const settings = await getAdminSettingRows();
  const missing = settings.filter((setting) => setting.status === "missing");

  return (
    <AdminPage
      eyebrow="Settings"
      title="Site settings"
      intro="Manage global settings such as contact email, public site URL, Drive folder status, and media upload limits."
    >
      {missing.length ? (
        <AdminNotice tone="warning">
          {missing.length} required setting{missing.length === 1 ? " is" : "s are"} still
          missing. Google Drive uploads will not work until Google auth is complete.
        </AdminNotice>
      ) : (
        <AdminNotice>Core environment settings are configured.</AdminNotice>
      )}
      <div className="mt-6">
        <AdminCard title="Configuration" eyebrow={`${settings.length} settings`}>
          <AdminTable
            columns={["Key", "Value", "Source", "Status"]}
            rows={settings.map((setting) => [
              setting.key,
              <span key={`${setting.key}-value`} className="break-all">
                {setting.value}
              </span>,
              setting.source,
              <StatusPill key={`${setting.key}-status`} value={setting.status} />,
            ])}
            empty={<p className="text-sm text-papyrus/55">No settings found.</p>}
          />
        </AdminCard>
      </div>
    </AdminPage>
  );
}
