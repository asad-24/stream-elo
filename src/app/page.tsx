import { ArrowDown } from "lucide-react";
import { CinematicButton } from "@/components/cinematic-button";
import { FilmCard } from "@/components/film-card";
import { IntroGallery } from "@/components/interactive/intro-gallery";
import { Reveal } from "@/components/interactive/reveal";
import { SectionHeading } from "@/components/section-heading";
import { PartnershipBenefits } from "@/components/sections/partnership-benefits";
import { StatsBand } from "@/components/sections/stats-band";
import { TheatreCard } from "@/components/theatre-card";
import { asset, featuredFilms, projects, theatreProductions } from "@/lib/content";

export default function Home() {
  return (
    <>
      <section className="relative min-h-[92svh] overflow-hidden pt-20">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={asset.heroPoster}
          aria-hidden="true"
        >
          <source src={asset.heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/70 to-obsidian/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-obsidian/30" />
        <div className="container-shell relative flex min-h-[calc(92svh-5rem)] items-end py-12 md:py-16">
          <Reveal className="max-w-4xl">
            <p className="label">Film · Documentary · Theatre</p>
            <h1 className="mt-6 max-w-4xl font-serif text-4xl leading-[0.98] text-papyrus sm:text-5xl md:text-6xl lg:text-7xl">
              Africa has always told its own{" "}
              <span className="editorial">stories.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-papyrus/72 md:text-lg">
              Meroestream produces and curates African cinema, documentary,
              music, and live theatre rooted in tradition, speaking to the world.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <CinematicButton href="/portfolio">Explore Our Work</CinematicButton>
              <CinematicButton href="/contact" variant="secondary">
                Partner With Us
              </CinematicButton>
            </div>
          </Reveal>
        </div>
        <a
          href="#intro"
          className="absolute bottom-6 right-6 inline-flex h-12 w-12 items-center justify-center rounded-full border border-papyrus/20 text-papyrus"
          aria-label="Scroll to introduction"
        >
          <ArrowDown className="h-5 w-5" />
        </a>
      </section>

      <section id="intro" className="bg-obsidian py-20 md:py-28">
        <div className="container-shell grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <SectionHeading
              eyebrow="Introduction"
              title={
                <>
                  Stories make us human.{" "}
                  <span className="editorial">Ours is told with an African accent.</span>
                </>
              }
              intro="Meroestream exists to widen the frame for African storytellers across film, documentary, theatre, and performance."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <IntroGallery
              images={[
                {
                  src: "/intro-iron-river.svg",
                  alt: "The Iron River poster artwork",
                },
                {
                  src: "/intro-ticket-life.svg",
                  alt: "Ticket To Life poster artwork",
                },
                {
                  src: "/intro-double-whammy.svg",
                  alt: "Double Whammy poster artwork",
                },
                {
                  src: "/intro-palmwine.svg",
                  alt: "The Palmwine Drinkard poster artwork",
                },
              ]}
            />
          </Reveal>
        </div>
      </section>

      <section className="bg-[#080705] py-20 md:py-28">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Featured work"
            title={
              <>
                Cinema, stage, sound, <span className="editorial">and memory</span>
              </>
            }
            intro="A focused selection from the growing Meroestream slate."
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {projects.slice(0, 3).map((film) => (
              <FilmCard key={film.slug} film={film} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-obsidian py-20 md:py-28">
        <div className="container-shell">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="Theatre productions"
              title={
                <>
                  Live stories with <span className="editorial">ritual force</span>
                </>
              }
              intro="Stage work designed for bodies, music, language, and myth."
            />
            <CinematicButton href="/theatre" variant="secondary">
              View Theatre
            </CinematicButton>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {theatreProductions.slice(0, 2).map((production) => (
              <TheatreCard key={production.title} production={production} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#090705] py-20 md:py-28">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Featured films"
            title={
              <>
                On screen <span className="editorial">now</span>
              </>
            }
            intro="Features, documentaries, and short films curated by the Meroestream editorial team."
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {featuredFilms.map((film) => (
              <FilmCard key={film.slug} film={film} />
            ))}
          </div>
        </div>
      </section>

      <StatsBand />

      <section className="bg-obsidian py-20 md:py-28">
        <div className="container-shell grid gap-10 md:grid-cols-[0.75fr_1fr] md:items-end">
          <p className="label">Manifesto</p>
          <blockquote className="font-serif text-4xl leading-[1.04] text-papyrus md:text-6xl">
            We do not treat African culture as texture. We treat it as source,
            structure, memory, and <span className="editorial">future.</span>
          </blockquote>
        </div>
      </section>

      <PartnershipBenefits />

      <section className="bg-obsidian py-20 md:py-28">
        <div className="container-shell border border-papyrus/10 bg-papyrus/[0.035] p-7 md:p-12">
          <p className="label">Contact</p>
          <div className="mt-5 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <h2 className="font-serif text-4xl leading-tight text-papyrus md:text-6xl">
              Ready to bring your story to the screen or stage?
            </h2>
            <CinematicButton href="/contact">Start a Conversation</CinematicButton>
          </div>
        </div>
      </section>
    </>
  );
}
