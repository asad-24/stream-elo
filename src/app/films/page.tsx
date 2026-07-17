import type { Metadata } from "next";
import { FilmCard } from "@/components/film-card";
import { SectionHeading } from "@/components/section-heading";
import { featuredFilms, projects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Featured Films",
  description: "Featured Meroestream films and documentary projects.",
};

export default function FilmsPage() {
  const filmSlate = [...featuredFilms, ...projects.filter((project) => project.category === "Documentaries")];

  return (
    <section className="bg-[#090705] pt-36 md:pt-44">
      <div className="container-shell pb-20 md:pb-28">
        <SectionHeading
          eyebrow="Featured films"
          title={
            <>
              On screen <span className="editorial">now</span>
            </>
          }
          intro="Cinematic film cards with artwork, metadata, and accessible trailer playback for YouTube and MP4 sources."
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
