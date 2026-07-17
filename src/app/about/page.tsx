import type { Metadata } from "next";
import Image from "next/image";
import { SectionHeading } from "@/components/section-heading";
import { StatsBand } from "@/components/sections/stats-band";
import { asset } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Meroestream, its mission, and its connection to African cultural storytelling.",
};

export default function AboutPage() {
  return (
    <>
      <section className="bg-papyrus pt-36 text-obsidian md:pt-44">
        <div className="container-shell pb-20 md:pb-28">
          <p className="label text-crimson">About Meroestream</p>
          <h1 className="mt-6 max-w-5xl font-serif text-6xl leading-[0.92] md:text-8xl">
            More than entertainment:{" "}
            <span className="editorial text-crimson">rewiring culture</span>
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-8 text-obsidian/68">
            Meroestream is a home for African film, documentary, music, and live
            theatre: a cultural engine for artists and audiences who know that
            stories shape identity.
          </p>
        </div>
      </section>
      <section className="bg-obsidian py-20 md:py-28">
        <div className="container-shell grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="relative min-h-[28rem] overflow-hidden border border-papyrus/10">
            <Image
              src={asset.ironRiver}
              alt="Golden Meroestream visual"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="space-y-7 text-base leading-8 text-papyrus/68">
            <SectionHeading
              eyebrow="Meroë"
              title={
                <>
                  Ancient city, <span className="editorial">living signal</span>
                </>
              }
            />
            <p>
              The name Meroestream draws from Meroë, the ancient Nubian city and
              cultural centre known for power, craft, trade, language, and
              imagination. It gives the company a grounding: African stories are
              not emerging from silence, they are continuing a long, sophisticated
              tradition.
            </p>
            <p>
              Our mission is to support rising filmmakers, writers, directors,
              actors, musicians, and performers while building a global audience
              across Africa and the diaspora.
            </p>
            <p>
              We focus on work that strengthens cultural identity without closing
              the door to the world: films, documentaries, theatre productions,
              and music-led stories with craft, texture, and ambition.
            </p>
          </div>
        </div>
      </section>
      <StatsBand />
      <section className="bg-[#090705] py-20 md:py-28">
        <div className="container-shell grid gap-8 md:grid-cols-3">
          {[
            "African storytelling and cultural identity are the foundation.",
            "Talent development is built into the production model.",
            "The audience is local, continental, and diaspora-facing.",
          ].map((item) => (
            <article key={item} className="border border-papyrus/10 p-6">
              <p className="font-serif text-3xl leading-tight text-papyrus">{item}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
