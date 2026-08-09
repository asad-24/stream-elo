import { AdminPage } from "@/components/admin/admin-page";
import { AdminCard, AdminNotice } from "@/components/admin/admin-widgets";
import { MediaUploadForm } from "@/components/admin/media-upload-form";
import { YoutubeVideoForm } from "@/components/admin/youtube-video-form";
import { getAdminSettingRows } from "@/lib/server/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminVideoUploadPage() {
  const settings = await getAdminSettingRows();
  const missingR2 = settings.filter(
    (setting) => setting.key.startsWith("R2 ") && setting.status === "missing",
  );

  return (
    <AdminPage
      eyebrow="Upload video"
      title="Add a video"
      intro="Upload a video file to Cloudflare R2, or save a YouTube link directly in MongoDB."
    >
      {missingR2.length ? (
        <AdminNotice tone="warning">
          Uploads are waiting on Cloudflare R2 environment variables. Add the R2
          account, bucket, credentials, and public base URL, then restart the dev server.
        </AdminNotice>
      ) : null}
      <div className="mt-6">
        <AdminCard title="Add from YouTube" eyebrow="MongoDB link">
          <YoutubeVideoForm />
        </AdminCard>
      </div>
      <div className="mt-6">
        <AdminCard title="Upload video file" eyebrow="Cloudflare R2">
          <MediaUploadForm defaultMediaType="video" />
        </AdminCard>
      </div>
    </AdminPage>
  );
}
