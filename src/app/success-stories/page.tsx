import type { Metadata } from "next";
import { SuccessStoriesPanel } from "@/components/interactive/success-stories-panel";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Success Stories",
  description:
    "Meroestream success stories and supported African creative voices.",
};

export default function SuccessStoriesPage() {
  return (
    <section className="bg-obsidian pt-36 md:pt-44">
      <div className="container-shell pb-20 md:pb-28">
        <SectionHeading
          eyebrow="Success stories"
          title={
            <>
              Talent shaped by <span className="editorial">opportunity</span>
            </>
          }
          intro="A first look at performers, directors, and creative collaborators growing through the Meroestream ecosystem."
        />
        <div className="mt-12">
          <SuccessStoriesPanel />
        </div>
      </div>
    </section>
  );
}
