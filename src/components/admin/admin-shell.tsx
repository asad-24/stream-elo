import Link from "next/link";
import { type ReactNode } from "react";
import { canAccessAdminArea, type AdminSession } from "@/lib/server/admin-auth";

const links: Array<{
  href: string;
  label: string;
  role?: AdminSession["role"];
}> = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/images", label: "Images" },
  { href: "/admin/videos", label: "Videos" },
  { href: "/admin/videos/upload", label: "Upload Video" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/settings", label: "Settings", role: "admin" },
  { href: "/admin/users", label: "Users", role: "super-admin" },
  { href: "/admin/profile", label: "Profile" },
];

export function AdminShell({
  children,
  user,
}: {
  children: ReactNode;
  user: { name: string; email: string; role: AdminSession["role"] };
}) {
  return (
    <div className="min-h-screen bg-[#080705] text-papyrus">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-papyrus/10 bg-obsidian/95 p-5 lg:block">
        <Link href="/admin/dashboard" className="font-serif text-3xl text-sahel">
          meroeStream
        </Link>
        <p className="mt-2 text-xs text-papyrus/50">{user.email}</p>
        <nav className="mt-8 space-y-1">
          {links
            .filter((link) => !link.role || canAccessAdminArea(user.role, link.role))
            .map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block border border-transparent px-3 py-2 text-sm text-papyrus/68 transition hover:border-papyrus/10 hover:bg-papyrus/[0.035] hover:text-sahel"
              >
                {link.label}
              </Link>
            ))}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-papyrus/10 bg-obsidian/90 px-5 py-4 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="label">Admin</p>
              <p className="mt-1 text-sm text-papyrus/60">
                {user.name} · {user.role}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 lg:hidden">
              {links.slice(0, 6).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-papyrus/10 px-3 py-2 text-xs text-papyrus/68"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <Link
              href="/admin/logout"
              className="rounded-full border border-papyrus/15 px-4 py-2 font-label text-xs uppercase tracking-[0.16em] text-papyrus/70 hover:border-sahel hover:text-sahel"
            >
              Logout
            </Link>
          </div>
        </header>
        <main className="p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
