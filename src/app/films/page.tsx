import type { Metadata } from "next";
import { FilmCard } from "@/components/film-card";
import { SectionHeading } from "@/components/section-heading";
import { getPageHeader, getProjectsContent } from "@/lib/content-service";

export const metadata: Metadata = {
  title: "Featured Films",
  description: "Featured Meroestream films and documentary projects.",
};

export const dynamic = "force-dynamic";

export default async function FilmsPage() {
  const [projects, header] = await Promise.all([getProjectsContent(), getPageHeader("films", { eyebrow: "Featured films", heading: "On screen now", body: "Cinematic film cards with artwork, metadata, and accessible trailer playback for YouTube and MP4 sources." })]);
  const filmSlate = projects.filter(
    (project) => project.category === "Film" || project.category === "Documentaries",
  );

  return (
    <section className="bg-[#090705] pt-36 md:pt-44">
      <div className="container-shell pb-20 md:pb-28">
        <SectionHeading
          eyebrow={header.eyebrow}
          title={header.heading}
          intro={header.body}
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {filmSlate.map((film) => (
            <FilmCard key={`${film.slug}-${film.title}`} film={film} />
          ))}
        </div>
      </div>
    </section>
  );
}
