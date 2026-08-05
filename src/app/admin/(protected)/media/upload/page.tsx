import { AdminPage } from "@/components/admin/admin-page";
import { AdminCard, AdminNotice } from "@/components/admin/admin-widgets";
import { MediaUploadForm } from "@/components/admin/media-upload-form";
import { getAdminSettingRows } from "@/lib/server/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminMediaUploadPage() {
  const settings = await getAdminSettingRows();
  const missingR2 = settings.filter(
    (setting) => setting.key.startsWith("R2 ") && setting.status === "missing",
  );

  return (
    <AdminPage
      eyebrow="Upload"
      title="Upload media"
      intro="Image and video upload entry point. Files are saved to Cloudflare R2 and served from the public CDN domain."
    >
      {missingR2.length ? (
        <AdminNotice tone="warning">
          Cloudflare R2 uploads need R2 account, bucket, credentials, and public base
          URL environment variables.
        </AdminNotice>
      ) : null}
      <div className="mt-6">
        <AdminCard title="Upload to R2" eyebrow="Media file">
          <MediaUploadForm defaultMediaType="image" />
        </AdminCard>
      </div>
    </AdminPage>
  );
}
