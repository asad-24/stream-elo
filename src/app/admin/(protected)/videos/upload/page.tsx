import { AdminPage } from "@/components/admin/admin-page";
import { AdminCard, AdminNotice } from "@/components/admin/admin-widgets";
import { MediaUploadForm } from "@/components/admin/media-upload-form";
import { getAdminSettingRows, getDriveFolderOptions } from "@/lib/server/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminVideoUploadPage() {
  const [folderOptions, settings] = await Promise.all([
    getDriveFolderOptions(),
    getAdminSettingRows(),
  ]);
  const googleAuth = settings.find((setting) => setting.key === "Google auth");

  return (
    <AdminPage
      eyebrow="Upload video"
      title="Google Drive video upload"
      intro="This page will initiate resumable Google Drive uploads, display progress, support retry/cancel, and save video metadata to MongoDB."
    >
      {googleAuth?.status === "missing" ? (
        <AdminNotice tone="warning">
          Uploads are waiting on Google OAuth credentials. Add GOOGLE_CLIENT_SECRET
          and GOOGLE_REFRESH_TOKEN, then restart the dev server.
        </AdminNotice>
      ) : null}
      <div className="mt-6">
        <AdminCard title="Upload video file" eyebrow="Google Drive">
          <MediaUploadForm defaultMediaType="video" folderOptions={folderOptions} />
        </AdminCard>
      </div>
    </AdminPage>
  );
}
