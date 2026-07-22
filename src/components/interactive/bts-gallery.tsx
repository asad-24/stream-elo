"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { btsProjects } from "@/lib/content";

export function BtsGallery() {
  const [projectIndex, setProjectIndex] = useState(0);
  const [mediaIndex, setMediaIndex] = useState<number | null>(null);
  const project = btsProjects[projectIndex];
  const activeMedia = mediaIndex === null ? null : project.media[mediaIndex];

  useEffect(() => {
    if (mediaIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMediaIndex(null);
      if (event.key === "ArrowRight") {
        setMediaIndex((value) =>
          value === null ? value : (value + 1) % project.media.length,
        );
      }
      if (event.key === "ArrowLeft") {
        setMediaIndex((value) =>
          value === null
            ? value
            : (value - 1 + project.media.length) % project.media.length,
        );
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mediaIndex, project.media.length]);

  return (
    <div className="grid gap-8 lg:grid-cols-[0.38fr_1fr]">
      <div className="space-y-2">
        {btsProjects.map((item, index) => (
          <button
            key={item.title}
            type="button"
            onClick={() => {
              setProjectIndex(index);
              setMediaIndex(null);
            }}
            className={`min-h-14 w-full border px-5 text-left font-serif text-2xl transition ${
              projectIndex === index
                ? "border-sahel bg-sahel text-obsidian"
                : "border-papyrus/10 bg-papyrus/[0.03] text-papyrus hover:border-sahel"
            }`}
          >
            {item.title}
          </button>
        ))}
      </div>
      <div>
        <AnimatePresence mode="wait">
          <motion.div
            key={project.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.45 }}
          >
            <p className="label">Gallery</p>
            <h2 className="mt-4 font-serif text-4xl text-papyrus">
              {project.title}
            </h2>
            <p className="mt-4 max-w-2xl text-papyrus/64">{project.details}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {project.media.map((item, index) => (
                <button
                  key={item.src}
                  type="button"
                  onClick={() => setMediaIndex(index)}
                  className="group relative aspect-[4/5] overflow-hidden border border-papyrus/10 text-left"
                >
                  <Image
                    src={item.src}
                    alt={item.caption}
                    fill
                    sizes="(min-width: 1280px) 24vw, (min-width: 640px) 45vw, 100vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-obsidian p-4 text-sm text-papyrus">
                    {item.caption}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {activeMedia ? (
          <motion.div
            className="fixed inset-0 z-[90] grid place-items-center bg-black/88 p-4 backdrop-blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${project.title} media viewer`}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setMediaIndex(null);
            }}
          >
            <div className="w-full max-w-6xl">
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className="font-serif text-3xl text-papyrus">
                  {activeMedia.caption}
                </p>
                <button
                  type="button"
                  onClick={() => setMediaIndex(null)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-papyrus/20 text-papyrus"
                  aria-label="Close gallery"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="relative aspect-[16/10] overflow-hidden border border-papyrus/10 bg-obsidian">
                <Image
                  src={activeMedia.src}
                  alt={activeMedia.caption}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
                <button
                  type="button"
                  className="absolute left-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-obsidian/80 text-papyrus"
                  aria-label="Previous image"
                  onClick={() =>
                    setMediaIndex((value) =>
                      value === null
                        ? value
                        : (value - 1 + project.media.length) % project.media.length,
                    )
                  }
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="absolute right-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-obsidian/80 text-papyrus"
                  aria-label="Next image"
                  onClick={() =>
                    setMediaIndex((value) =>
                      value === null ? value : (value + 1) % project.media.length,
                    )
                  }
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
