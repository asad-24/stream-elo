import { redirect } from "next/navigation";
import { AdminPage } from "@/components/admin/admin-page";
import {
  AdminCard,
  AdminNotice,
  AdminTable,
  EmptyState,
  StatusPill,
} from "@/components/admin/admin-widgets";
import { canAccessAdminArea, getCurrentAdminUser } from "@/lib/server/admin-auth";
import { getAdminUserRows } from "@/lib/server/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const user = await getCurrentAdminUser();
  if (!user || !canAccessAdminArea(user.role, "super-admin")) {
    redirect("/admin/dashboard");
  }
  const users = await getAdminUserRows();

  return (
    <AdminPage
      eyebrow="Users"
      title="Administrator users"
      intro="Super admins can manage administrator accounts, roles, active status, and password resets."
    >
      {!users.ok ? <AdminNotice tone="error">{users.error}</AdminNotice> : null}
      <AdminCard title="Admin accounts" eyebrow={`${users.rows.length} users`}>
        <AdminTable
          columns={["Name", "Email", "Role", "Active", "Last login", "Created"]}
          rows={users.rows.map((admin) => [
            admin.name,
            admin.email,
            <StatusPill key={`${admin.id}-role`} value={admin.role} />,
            <StatusPill key={`${admin.id}-active`} value={admin.isActive} />,
            admin.lastLoginAt,
            admin.createdAt,
          ])}
          empty={
            <EmptyState
              title="No admin users found"
              body="Run npm run seed:admin or create a user record in MongoDB to add administrators."
            />
          }
        />
      </AdminCard>
    </AdminPage>
  );
}
