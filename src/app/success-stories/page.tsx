import type { Metadata } from "next";
import { SuccessStoriesPanel } from "@/components/interactive/success-stories-panel";
import { SectionHeading } from "@/components/section-heading";
import { getPageHeader, getSuccessStoriesContent } from "@/lib/content-service";

export const metadata: Metadata = {
  title: "Success Stories",
  description:
    "Meroestream success stories and supported African creative voices.",
};

export const dynamic = "force-dynamic";
export default async function SuccessStoriesPage() {
  const [stories, header] = await Promise.all([getSuccessStoriesContent(), getPageHeader("success-stories", { eyebrow: "Success stories", heading: "Talent shaped by opportunity", body: "A first look at performers, directors, and creative collaborators growing through the Meroestream ecosystem." })]);
  return (
    <section className="bg-obsidian pt-36 md:pt-44">
      <div className="container-shell pb-20 md:pb-28">
        <SectionHeading
          eyebrow={header.eyebrow}
          title={header.heading}
          intro={header.body}
        />
        <div className="mt-12">
          <SuccessStoriesPanel items={stories} />
        </div>
      </div>
    </section>
  );
}
