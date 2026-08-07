import type { Metadata } from "next";
import { TheatreCard } from "@/components/theatre-card";
import { SectionHeading } from "@/components/section-heading";
import { getPageHeader, getTheatreContent } from "@/lib/content-service";

export const metadata: Metadata = {
  title: "Theatre",
  description: "Meroestream live theatre productions and stage projects.",
};

export const dynamic = "force-dynamic";
export default async function TheatrePage() {
  const [productions, header] = await Promise.all([getTheatreContent(), getPageHeader("theatre", { eyebrow: "Theatre productions", heading: "Live work with ancestral voltage", body: "Stage productions carrying myth, movement, music, and contemporary African performance language." })]);
  return (
    <section className="bg-obsidian pt-36 md:pt-44">
      <div className="container-shell pb-20 md:pb-28">
        <SectionHeading
          eyebrow={header.eyebrow}
          title={header.heading}
          intro={header.body}
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {productions.map((production) => (
            <TheatreCard key={production.title} production={production} />
          ))}
        </div>
      </div>
    </section>
  );
}
