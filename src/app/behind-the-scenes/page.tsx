import type { Metadata } from "next";
import { BtsGallery } from "@/components/interactive/bts-gallery";
import { SectionHeading } from "@/components/section-heading";
import { getProjectsContent } from "@/lib/content-service";

export const metadata: Metadata = {
  title: "Behind the Scenes",
  description:
    "Behind-the-scenes galleries from Meroestream film and theatre projects.",
};

export const dynamic = "force-dynamic";

export default async function BehindTheScenesPage() {
  const projects = await getProjectsContent();
  const galleries = projects
    .filter((project) => project.gallery.length)
    .map((project) => ({
      title: project.title,
      details: project.fullSynopsis,
      media: project.gallery.map((src, index) => ({
        src,
        caption: `${project.title} image ${index + 1}`,
      })),
    }));

  return (
    <section className="bg-obsidian pt-36 md:pt-44">
      <div className="container-shell pb-20 md:pb-28">
        <SectionHeading
          eyebrow="Behind the scenes"
          title={
            <>
              The making is part of <span className="editorial">the story</span>
            </>
          }
          intro="Open galleries for production stills, rehearsal images, campaign artwork, and project details."
        />
        <div className="mt-12">
          <BtsGallery items={galleries} />
        </div>
      </div>
    </section>
  );
}
