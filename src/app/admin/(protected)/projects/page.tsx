import Link from "next/link";
import { AdminPage } from "@/components/admin/admin-page";
import {
  AdminCard,
  AdminNotice,
  AdminTable,
  EmptyState,
  StatusPill,
} from "@/components/admin/admin-widgets";
import { getAdminProjectRows } from "@/lib/server/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await getAdminProjectRows();

  return (
    <AdminPage
      eyebrow="Projects"
      title="Project management"
      intro="Create, edit, publish, sort, and archive films, documentaries, theatre, and music projects."
    >
      {!projects.ok ? <AdminNotice tone="warning">{projects.error}</AdminNotice> : null}
      <Link
        href="/admin/projects/new"
        className="inline-flex min-h-12 items-center rounded-full bg-sahel px-5 font-label text-xs font-bold uppercase tracking-[0.18em] text-obsidian"
      >
        New project
      </Link>
      <div className="mt-6">
        <AdminCard title="Project records" eyebrow={`${projects.rows.length} projects`}>
          <AdminTable
            columns={["Title", "Category", "Status", "Featured", "Source", "Updated"]}
            rows={projects.rows.map((project) => [
              <div key={`${project.id}-title`}>
                {project.source === "MongoDB" ? (
                  <Link
                    href={`/admin/projects/${project.id}/edit`}
                    className="text-papyrus underline-offset-4 hover:text-sahel hover:underline"
                  >
                    {project.title}
                  </Link>
                ) : (
                  <p className="text-papyrus">{project.title}</p>
                )}
                <p className="mt-1 text-xs text-papyrus/40">/{project.slug}</p>
              </div>,
              project.category,
              <StatusPill key={`${project.id}-status`} value={project.status} />,
              project.featured,
              <StatusPill key={`${project.id}-source`} value={project.source} />,
              project.updatedAt,
            ])}
            empty={
              <EmptyState
                title="No projects found"
                body="Create a project record to manage it from MongoDB."
              />
            }
          />
        </AdminCard>
      </div>
    </AdminPage>
  );
}
