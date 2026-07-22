import { AdminPage } from "@/components/admin/admin-page";
import { AdminCard, AdminTable, StatusPill } from "@/components/admin/admin-widgets";
import { getCurrentAdminUser } from "@/lib/server/admin-auth";

export const dynamic = "force-dynamic";

function formatDate(value: Date | string | undefined) {
  if (!value) return "Not set";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminProfilePage() {
  const user = await getCurrentAdminUser();

  return (
    <AdminPage
      eyebrow="Profile"
      title="Admin profile"
      intro={`${user?.name ?? "Admin"} · ${user?.email ?? ""} · ${user?.role ?? ""}`}
    >
      <AdminCard title="Current account" eyebrow="Signed in">
        <AdminTable
          columns={["Field", "Value"]}
          rows={[
            ["Name", user?.name ?? "Admin"],
            ["Email", user?.email ?? "Not set"],
            ["Role", <StatusPill key="role" value={user?.role ?? "editor"} />],
            ["Active", <StatusPill key="active" value={user?.isActive ? "Yes" : "No"} />],
            ["Last login", formatDate(user?.lastLoginAt)],
            ["Created", formatDate(user?.createdAt)],
          ]}
          empty={<p className="text-sm text-papyrus/55">Profile unavailable.</p>}
        />
      </AdminCard>
    </AdminPage>
  );
}
