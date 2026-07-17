import type { Metadata } from "next";
import { TheatreCard } from "@/components/theatre-card";
import { SectionHeading } from "@/components/section-heading";
import { theatreProductions } from "@/lib/content";

export const metadata: Metadata = {
  title: "Theatre",
  description: "Meroestream live theatre productions and stage projects.",
};

export default function TheatrePage() {
  return (
    <section className="bg-obsidian pt-36 md:pt-44">
      <div className="container-shell pb-20 md:pb-28">
        <SectionHeading
          eyebrow="Theatre productions"
          title={
            <>
              Live work with <span className="editorial">ancestral voltage</span>
            </>
          }
          intro="Stage productions carrying myth, movement, music, and contemporary African performance language."
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {theatreProductions.map((production) => (
            <TheatreCard key={production.title} production={production} />
          ))}
        </div>
      </div>
    </section>
  );
}
