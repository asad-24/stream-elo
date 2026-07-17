import type { Metadata } from "next";
import { PortfolioFilter } from "@/components/interactive/portfolio-filter";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Explore Meroestream film, documentary, theatre, and music projects.",
};

export default function PortfolioPage() {
  return (
    <section className="bg-obsidian pt-36 md:pt-44">
      <div className="container-shell pb-20 md:pb-28">
        <SectionHeading
          eyebrow="Portfolio"
          title={
            <>
              A slate of screen, stage, <span className="editorial">and sound</span>
            </>
          }
          intro="Filter the Meroestream portfolio by discipline without leaving the page."
        />
        <div className="mt-12">
          <PortfolioFilter />
        </div>
      </div>
    </section>
  );
}
