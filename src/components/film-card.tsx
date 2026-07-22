import Image from "next/image";
import { type Project } from "@/lib/content";
import { StatusBadge } from "@/components/status-badge";
import { VideoModal } from "@/components/interactive/video-modal";

export function FilmCard({ film }: { film: Project }) {
  return (
    <article className="group relative min-h-[34rem] overflow-hidden border border-papyrus/10 bg-papyrus/[0.035]">
      <Image
        src={film.poster}
        alt={`${film.title} artwork`}
        fill
        sizes="(min-width: 1024px) 32vw, 100vw"
        className="object-cover transition duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/35 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
        <div className="flex items-center justify-between gap-3">
          <StatusBadge status={film.status} />
          {film.video ? <VideoModal video={film.video} title={film.title} compact /> : null}
        </div>
        <p className="label mt-8 text-[0.62rem]">{film.category}</p>
        <h3 className="mt-3 font-serif text-3xl leading-tight text-papyrus">
          {film.title}
        </h3>
        <dl className="mt-5 grid grid-cols-2 gap-3 text-xs text-papyrus/65">
          <div>
            <dt className="sr-only">Director</dt>
            <dd>{film.director}</dd>
          </div>
          <div>
            <dt className="sr-only">Year</dt>
            <dd>{film.year}</dd>
          </div>
          <div>
            <dt className="sr-only">Running time</dt>
            <dd>{film.duration}</dd>
          </div>
          <div>
            <dt className="sr-only">Location</dt>
            <dd>{film.location}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
