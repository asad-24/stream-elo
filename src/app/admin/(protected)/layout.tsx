import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { getCurrentAdminUser } from "@/lib/server/admin-auth";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentAdminUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <AdminShell
      user={{
        name: user.name,
        email: user.email,
        role: user.role,
      }}
    >
      {children}
    </AdminShell>
  );
}
