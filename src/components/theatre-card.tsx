import Image from "next/image";
import { type theatreProductions } from "@/lib/content";
import { StatusBadge } from "@/components/status-badge";

type TheatreProduction = (typeof theatreProductions)[number];

export function TheatreCard({ production }: { production: TheatreProduction }) {
  return (
    <article className="group overflow-hidden border border-papyrus/10 bg-papyrus/[0.035]">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={production.poster}
          alt={`${production.title} poster`}
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
      </div>
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={production.status} />
          <span className="font-label text-[0.62rem] uppercase tracking-[0.18em] text-papyrus/45">
            {production.city}, {production.country}
          </span>
        </div>
        <h3 className="mt-5 font-serif text-3xl leading-tight text-papyrus">
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
