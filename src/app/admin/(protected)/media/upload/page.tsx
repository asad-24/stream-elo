import { AdminPage } from "@/components/admin/admin-page";
import { AdminCard, AdminNotice } from "@/components/admin/admin-widgets";
import { MediaUploadForm } from "@/components/admin/media-upload-form";
import { getDriveFolderOptions, getAdminSettingRows } from "@/lib/server/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminMediaUploadPage() {
  const [folderOptions, settings] = await Promise.all([
    getDriveFolderOptions(),
    getAdminSettingRows(),
  ]);
  const googleAuth = settings.find((setting) => setting.key === "Google auth");

  return (
    <AdminPage
      eyebrow="Upload"
      title="Upload media"
      intro="Image and video upload entry point. Video uploads will use the secure Google Drive resumable upload API."
    >
      {googleAuth?.status === "missing" ? (
        <AdminNotice tone="warning">
          Google Drive folder IDs are saved, but uploads need GOOGLE_CLIENT_SECRET and
          GOOGLE_REFRESH_TOKEN, or service-account credentials, in .env.local.
        </AdminNotice>
      ) : null}
      <div className="mt-6">
        <AdminCard title="Upload to Google Drive" eyebrow="Media file">
          <MediaUploadForm defaultMediaType="image" folderOptions={folderOptions} />
        </AdminCard>
      </div>
    </AdminPage>
  );
}
