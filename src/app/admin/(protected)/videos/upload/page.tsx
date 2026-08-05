import { AdminPage } from "@/components/admin/admin-page";
import { AdminCard, AdminNotice } from "@/components/admin/admin-widgets";
import { MediaUploadForm } from "@/components/admin/media-upload-form";
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
      title="Cloudflare R2 video upload"
      intro="This page initiates multipart R2 uploads, displays progress, retries failed parts, and saves video metadata to MongoDB."
    >
      {missingR2.length ? (
        <AdminNotice tone="warning">
          Uploads are waiting on Cloudflare R2 environment variables. Add the R2
          account, bucket, credentials, and public base URL, then restart the dev server.
        </AdminNotice>
      ) : null}
      <div className="mt-6">
        <AdminCard title="Upload video file" eyebrow="Cloudflare R2">
          <MediaUploadForm defaultMediaType="video" />
        </AdminCard>
      </div>
    </AdminPage>
  );
}
