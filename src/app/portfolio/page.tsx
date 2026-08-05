import type { Metadata } from "next";
import { PortfolioFilter } from "@/components/interactive/portfolio-filter";
import { SectionHeading } from "@/components/section-heading";
import { getProjectsContent } from "@/lib/content-service";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Explore Meroestream film, documentary, theatre, and music projects.",
};

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const projects = await getProjectsContent();

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
          <PortfolioFilter projects={projects} />
        </div>
      </div>
    </section>
  );
}
