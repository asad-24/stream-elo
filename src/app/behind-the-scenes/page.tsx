import type { Metadata } from "next";
import { BtsGallery } from "@/components/interactive/bts-gallery";
import { SectionHeading } from "@/components/section-heading";
import { getBtsContent, getPageHeader } from "@/lib/content-service";

export const metadata: Metadata = {
  title: "Behind the Scenes",
  description:
    "Behind-the-scenes galleries from Meroestream film and theatre projects.",
};

export const dynamic = "force-dynamic";

export default async function BehindTheScenesPage() {
  const [galleries, header] = await Promise.all([getBtsContent(), getPageHeader("behind-the-scenes", { eyebrow: "Behind the scenes", heading: "The making is part of the story", body: "Open galleries for production stills, rehearsal images, campaign artwork, and project details." })]);

  return (
    <section className="bg-obsidian pt-36 md:pt-44">
      <div className="container-shell pb-20 md:pb-28">
        <SectionHeading
          eyebrow={header.eyebrow}
          title={header.heading}
          intro={header.body}
        />
        <div className="mt-12">
          <BtsGallery items={galleries} />
        </div>
      </div>
    </section>
  );
}
