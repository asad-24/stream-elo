import type { Metadata } from "next";
import { PortfolioFilter } from "@/components/interactive/portfolio-filter";
import { SectionHeading } from "@/components/section-heading";
import { getPageHeader, getProjectsContent } from "@/lib/content-service";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Explore Meroestream film, documentary, theatre, and music projects.",
};

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const [projects, header] = await Promise.all([getProjectsContent(), getPageHeader("portfolio", { eyebrow: "Portfolio", heading: "A slate of screen, stage, and sound", body: "Filter the Meroestream portfolio by discipline without leaving the page." })]);

  return (
    <section className="bg-obsidian pt-36 md:pt-44">
      <div className="container-shell pb-20 md:pb-28">
        <SectionHeading
          eyebrow={header.eyebrow}
          title={header.heading}
          intro={header.body}
        />
        <div className="mt-12">
          <PortfolioFilter projects={projects} />
        </div>
      </div>
    </section>
  );
}
