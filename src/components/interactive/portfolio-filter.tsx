"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { projects, type ProjectCategory, type Project } from "@/lib/content";
import { StatusBadge } from "@/components/status-badge";
import { VideoModal } from "@/components/interactive/video-modal";

const filters: Array<ProjectCategory | "All"> = [
  "All",
  "Film",
  "Documentaries",
  "Theatre",
  "Music",
];

function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className="group grid overflow-hidden border border-papyrus/10 bg-papyrus/[0.035] lg:grid-cols-[0.75fr_1fr]"
    >
      <div className="relative aspect-[4/5] overflow-hidden lg:aspect-auto">
        <Image
          src={project.poster}
          alt={`${project.title} poster`}
          fill
          sizes="(min-width: 1024px) 34vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-transparent" />
      </div>
      <div className="flex flex-col justify-between p-6 md:p-8">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={project.status} />
            <span className="font-label text-[0.65rem] uppercase tracking-[0.18em] text-sahel">
              {project.category}
            </span>
          </div>
          <h3 className="mt-5 font-serif text-3xl leading-tight text-papyrus md:text-4xl">
            {project.title}
          </h3>
          <p className="mt-5 text-sm leading-7 text-papyrus/66">
            {project.fullSynopsis}
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-4 text-xs text-papyrus/58 md:grid-cols-3">
            <div>
              <dt className="label text-[0.58rem]">Director</dt>
              <dd className="mt-2">{project.director}</dd>
            </div>
            <div>
              <dt className="label text-[0.58rem]">Year</dt>
              <dd className="mt-2">{project.year}</dd>
            </div>
            <div>
              <dt className="label text-[0.58rem]">Duration</dt>
              <dd className="mt-2">{project.duration}</dd>
            </div>
            <div>
              <dt className="label text-[0.58rem]">Location</dt>
              <dd className="mt-2">{project.location}</dd>
            </div>
            <div>
              <dt className="label text-[0.58rem]">Date</dt>
              <dd className="mt-2">{project.productionDate}</dd>
            </div>
            <div>
              <dt className="label text-[0.58rem]">Cast</dt>
              <dd className="mt-2">{project.cast.slice(0, 2).join(", ")}</dd>
            </div>
          </dl>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {project.video ? (
            <VideoModal video={project.video} title={project.title} />
          ) : (
            <span className="rounded-full border border-papyrus/10 px-4 py-3 font-label text-xs uppercase tracking-[0.18em] text-papyrus/45">
              Video pending
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export function PortfolioFilter() {
  const [active, setActive] = useState<ProjectCategory | "All">("All");
  const visible = useMemo(
    () => projects.filter((project) => active === "All" || project.category === active),
    [active],
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Project filters">
        {filters.map((filter) => (
          <button
            type="button"
            key={filter}
            role="tab"
            aria-selected={active === filter}
            onClick={() => setActive(filter)}
            className={`min-h-11 rounded-full border px-4 font-label text-[0.68rem] font-bold uppercase tracking-[0.16em] transition ${
              active === filter
                ? "border-sahel bg-sahel text-obsidian"
                : "border-papyrus/15 text-papyrus/65 hover:border-sahel hover:text-sahel"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
      <div className="mt-10 grid gap-6">
        <AnimatePresence mode="popLayout">
          {visible.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
