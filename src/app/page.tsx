import { ArrowDown } from "lucide-react";
/* eslint-disable @next/next/no-img-element -- R2 custom-domain assets are already CDN optimized. */
import { CinematicButton } from "@/components/cinematic-button";
import { FilmCard } from "@/components/film-card";
import { IntroGallery } from "@/components/interactive/intro-gallery";
import { Reveal } from "@/components/interactive/reveal";
import { SectionHeading } from "@/components/section-heading";
import { PartnershipBenefits } from "@/components/sections/partnership-benefits";
import { StatsBand } from "@/components/sections/stats-band";
import { TheatreCard } from "@/components/theatre-card";
import { asset, featuredFilms } from "@/lib/content";
import { getBenefitsContent, getHomeContent, getProjectsContent, getStatsContent, getTheatreContent } from "@/lib/content-service";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [publicProjects, homeContent, publicStats, publicBenefits, publicTheatre] = await Promise.all([getProjectsContent(), getHomeContent(), getStatsContent(), getBenefitsContent(), getTheatreContent()]);
  const homeSections = homeContent.sections as Array<{ section?: string; heading?: string; subheading?: string; body?: string; data?: Record<string, unknown>; resolvedMediaUrls?: string[] }>;
  const section = (name: string) => homeSections.find((item) => item.section === name);
  const hero = homeContent.hero as null | { heading?: string; subheading?: string; body?: string; data?: Record<string, unknown> };
  const heroData = hero?.data && typeof hero.data === "object" ? hero.data as Record<string, unknown> : {};
  const backgroundUrl = typeof heroData.backgroundUrl === "string" ? heroData.backgroundUrl : asset.heroVideo;
  const posterUrl = typeof heroData.posterUrl === "string" ? heroData.posterUrl : asset.heroPoster;
  const displayMode = heroData.displayMode === "image" ? "image" : "video";
  const primaryButton = heroData.primaryButton && typeof heroData.primaryButton === "object" ? heroData.primaryButton as { label?: string; href?: string } : {};
  const secondaryButton = heroData.secondaryButton && typeof heroData.secondaryButton === "object" ? heroData.secondaryButton as { label?: string; href?: string } : {};
  const intro = section("intro");
  const introData = intro?.data && typeof intro.data === "object" ? intro.data : {};
  const introImages = intro?.resolvedMediaUrls?.length ? intro.resolvedMediaUrls : Array.isArray(introData.images) ? introData.images.map(String) : ["/intro-iron-river.svg", "/intro-ticket-life.svg", "/intro-double-whammy.svg", "/intro-palmwine.svg"];
  const featured = section("featured-work"); const theatre = section("theatre"); const films = section("featured-films"); const manifesto = section("manifesto"); const partnership = section("partnership"); const contactCta = section("contact-cta");
  const contactButton = contactCta?.data?.button && typeof contactCta.data.button === "object" ? contactCta.data.button as { label?: string; href?: string } : {};
  const publicFeaturedFilms = publicProjects.filter(
    (project) => project.category === "Film" || project.category === "Documentaries",
  );

  return (
    <>
      <section className="relative min-h-[92svh] overflow-hidden pt-20">
        {displayMode === "video" ? <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={posterUrl}
          aria-hidden="true"
        >
          <source src={backgroundUrl} type="video/mp4" />
        </video> : <img className="absolute inset-0 h-full w-full object-cover" src={backgroundUrl} alt="" aria-hidden="true" />}
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/70 to-obsidian/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-obsidian/30" />
        <div className="container-shell relative flex min-h-[calc(92svh-5rem)] items-end py-12 md:py-16">
          <Reveal className="max-w-4xl">
            <p className="label">{hero?.subheading || "Film · Documentary · Theatre"}</p>
            <h1 className="mt-6 max-w-4xl font-serif text-4xl leading-[0.98] text-papyrus sm:text-5xl md:text-6xl lg:text-7xl">
              {hero?.heading || <>Africa has always told its own <span className="editorial">stories.</span></>}
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-papyrus/72 md:text-lg">
              {hero?.body || "Meroestream produces and curates African cinema, documentary, music, and live theatre rooted in tradition, speaking to the world."}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <CinematicButton href={primaryButton.href || "/portfolio"}>{primaryButton.label || "Explore Our Work"}</CinematicButton>
              <CinematicButton href={secondaryButton.href || "/contact"} variant="secondary">
                {secondaryButton.label || "Partner With Us"}
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
              eyebrow={intro?.subheading || "Introduction"}
              title={
                <>
                  {intro?.heading || <>Stories make us human. <span className="editorial">Ours is told with an African accent.</span></>}
                </>
              }
              intro={intro?.body || "Meroestream exists to widen the frame for African storytellers across film, documentary, theatre, and performance."}
            />
          </Reveal>
          <Reveal delay={0.1}>
            <IntroGallery
              images={introImages.map((src, index) => ({ src, alt: `Introduction image ${index + 1}` }))}
            />
          </Reveal>
        </div>
      </section>

      <section className="bg-[#080705] py-20 md:py-28">
        <div className="container-shell">
          <SectionHeading
            eyebrow={featured?.subheading || "Featured work"}
            title={
              <>
                {featured?.heading || <>Cinema, stage, sound, <span className="editorial">and memory</span></>}
              </>
            }
            intro={featured?.body || "A focused selection from the growing Meroestream slate."}
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {publicProjects.slice(0, 3).map((film) => (
              <FilmCard key={film.slug} film={film} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-obsidian py-20 md:py-28">
        <div className="container-shell">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow={theatre?.subheading || "Theatre productions"}
              title={
                <>
                  {theatre?.heading || <>Live stories with <span className="editorial">ritual force</span></>}
                </>
              }
              intro={theatre?.body || "Stage work designed for bodies, music, language, and myth."}
            />
            <CinematicButton href="/theatre" variant="secondary">
              View Theatre
            </CinematicButton>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {publicTheatre.slice(0, 2).map((production) => (
              <TheatreCard key={production.title} production={production} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#090705] py-20 md:py-28">
        <div className="container-shell">
          <SectionHeading
              eyebrow={films?.subheading || "Featured films"}
            title={
              <>
                  {films?.heading || <>On screen <span className="editorial">now</span></>}
              </>
            }
              intro={films?.body || "Features, documentaries, and short films curated by the Meroestream editorial team."}
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {(publicFeaturedFilms.length ? publicFeaturedFilms : featuredFilms)
              .slice(0, 3)
              .map((film) => (
                <FilmCard key={film.slug} film={film} />
              ))}
          </div>
        </div>
      </section>

      <StatsBand items={publicStats} />

      <section className="bg-obsidian py-20 md:py-28">
        <div className="container-shell grid gap-10 md:grid-cols-[0.75fr_1fr] md:items-end">
          <p className="label">{manifesto?.subheading || "Manifesto"}</p>
          <blockquote className="font-serif text-4xl leading-[1.04] text-papyrus md:text-6xl">
            {manifesto?.body || <>We do not treat African culture as texture. We treat it as source, structure, memory, and <span className="editorial">future.</span></>}
          </blockquote>
        </div>
      </section>

      <PartnershipBenefits items={publicBenefits} heading={partnership ? { eyebrow: partnership.subheading || "Partnership", title: partnership.heading || "Cultural weight, real reach", intro: partnership.body || "" } : undefined} />

      <section className="bg-obsidian py-20 md:py-28">
        <div className="container-shell border border-papyrus/10 bg-papyrus/[0.035] p-7 md:p-12">
          <p className="label">Contact</p>
          <div className="mt-5 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <h2 className="font-serif text-4xl leading-tight text-papyrus md:text-6xl">
              {contactCta?.heading || "Ready to bring your story to the screen or stage?"}
            </h2>
            <CinematicButton href={contactButton.href || "/contact"}>{contactButton.label || "Start a Conversation"}</CinematicButton>
          </div>
        </div>
      </section>
    </>
  );
}
