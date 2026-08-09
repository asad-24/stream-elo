import { type ProjectStatus, type VideoSource } from "@/lib/content";
import { StatusBadge } from "@/components/status-badge";
import { VideoModal } from "@/components/interactive/video-modal";
import { FittedCoverImage } from "@/components/ui/fitted-cover-image";

type TheatreProduction = { title: string; city: string; country: string; dates: string; status: ProjectStatus; poster: string; description: string; gallery: string[]; video?: VideoSource };

export function TheatreCard({ production }: { production: TheatreProduction }) {
  return (
    <article className="group overflow-hidden border border-papyrus/10 bg-papyrus/[0.035]">
      <div className="relative aspect-[4/3] overflow-hidden">
        <FittedCoverImage
          src={production.poster}
          alt={`${production.title} poster`}
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="group-hover:scale-[1.02]"
        />
      </div>
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={production.status} />
          <span className="font-label text-[0.62rem] uppercase tracking-[0.18em] text-papyrus/45">
            {production.city}, {production.country}
          </span>
          {production.video ? <VideoModal video={production.video} title={production.title} compact /> : null}
        </div>
        <h3 className="mt-5 font-serif text-2xl leading-tight text-papyrus">
          {production.title}
        </h3>
        <p className="mt-2 text-sm text-sahel">{production.dates}</p>
        <p className="mt-5 text-sm leading-7 text-papyrus/64">
          {production.description}
        </p>
      </div>
    </article>
  );
}
