import { AdminPage } from "@/components/admin/admin-page";
import {
  AdminCard,
  AdminLinkButton,
  AdminNotice,
  EmptyState,
  StatusPill,
} from "@/components/admin/admin-widgets";
import { SafeMediaImage } from "@/components/ui/safe-media-image";
import { getAdminMediaRows } from "@/lib/server/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminImagesPage() {
  const images = await getAdminMediaRows({ mediaType: "image", limit: 80 });

  return (
    <AdminPage
      eyebrow="Images"
      title="Image management"
      intro="Manage image metadata, alt text, captions, visibility, and Drive-backed image records."
    >
      {!images.ok ? <AdminNotice tone="error">{images.error}</AdminNotice> : null}
      <AdminCard
        title="Drive image records"
        eyebrow={`${images.rows.length} images`}
        action={<AdminLinkButton href="/admin/media/upload">Upload image</AdminLinkButton>}
      >
        {images.rows.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {images.rows.map((image) => (
              <article key={image.id} className="border border-papyrus/10 bg-obsidian/45">
                <div className="relative aspect-[4/3] bg-black/45">
                  <SafeMediaImage
                    source={
                      image.driveFileId
                        ? { type: "drive", mediaId: image.id }
                        : { type: "local", src: "/media/fallback-image.svg" }
                    }
                    alt={image.title}
                    fill
                    sizes="(min-width: 1280px) 28vw, (min-width: 640px) 42vw, 90vw"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-3 p-4">
                  <div>
                    <h3 className="font-serif text-2xl leading-tight text-papyrus">
                      {image.title}
                    </h3>
                    <p className="mt-1 truncate text-xs text-papyrus/45">{image.originalName}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusPill value={image.status} />
                    <StatusPill value={image.visibility} />
                  </div>
                  <p className="text-xs text-papyrus/45">{image.sizeLabel}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No images in MongoDB yet"
            body="Image uploads or imports will appear here with preview, metadata, visibility, and Drive references."
            action={<AdminLinkButton href="/admin/media/upload">Upload image</AdminLinkButton>}
          />
        )}
      </AdminCard>
    </AdminPage>
  );
}
