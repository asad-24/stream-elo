import type { Metadata } from "next";
import { BtsGallery } from "@/components/interactive/bts-gallery";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Behind the Scenes",
  description:
    "Behind-the-scenes galleries from Meroestream film and theatre projects.",
};

export default function BehindTheScenesPage() {
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
          <BtsGallery />
        </div>
      </div>
    </section>
  );
}
