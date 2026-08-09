import { AdminPage } from "@/components/admin/admin-page";
import {
  AdminCard,
  AdminLinkButton,
  AdminNotice,
  AdminTable,
  EmptyState,
  StatusPill,
} from "@/components/admin/admin-widgets";
import { getAdminMediaRows } from "@/lib/server/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminVideosPage() {
  const videos = await getAdminMediaRows({ mediaType: "video", limit: 80 });

  return (
    <AdminPage
      eyebrow="Videos"
      title="Video management"
      intro="Manage YouTube links and R2-backed video files from one library."
    >
      {!videos.ok ? <AdminNotice tone="error">{videos.error}</AdminNotice> : null}
      <AdminCard
        title="Video records"
        eyebrow={`${videos.rows.length} videos`}
        action={<AdminLinkButton href="/admin/videos/upload">Upload video</AdminLinkButton>}
      >
        <AdminTable
          columns={["Title", "Source", "Status", "Visibility", "Size", "Open"]}
          rows={videos.rows.map((video) => [
            <div key={`${video.id}-title`}>
              <p className="text-papyrus">{video.title}</p>
              <p className="mt-1 text-xs text-papyrus/40">{video.mimeType}</p>
            </div>,
            video.source,
            <StatusPill key={`${video.id}-status`} value={video.status} />,
            video.visibility,
            video.sizeLabel,
            video.publicUrl ? (
              <a
                key={`${video.id}-stream`}
                href={video.publicUrl}
                className="text-sahel underline-offset-4 hover:underline"
              >
                Open video
              </a>
            ) : (
              "Not linked"
            ),
          ])}
          empty={
            <EmptyState
              title="No videos in MongoDB yet"
              body="Video uploads or imports will appear here with stream and download links."
              action={<AdminLinkButton href="/admin/videos/upload">Upload video</AdminLinkButton>}
            />
          }
        />
      </AdminCard>
    </AdminPage>
  );
}
