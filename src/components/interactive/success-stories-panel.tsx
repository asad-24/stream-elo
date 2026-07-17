"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { successStories } from "@/lib/content";

export function SuccessStoriesPanel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = successStories[activeIndex];

  return (
    <div className="grid gap-8 lg:grid-cols-[0.45fr_1fr]">
      <div
        className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0"
        role="tablist"
        aria-label="Success stories"
      >
        {successStories.map((story, index) => (
          <button
            key={story.name}
            type="button"
            role="tab"
            aria-selected={activeIndex === index}
            aria-controls="success-panel"
            onClick={() => setActiveIndex(index)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" || event.key === "ArrowRight") {
                event.preventDefault();
                setActiveIndex((index + 1) % successStories.length);
              }
              if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
                event.preventDefault();
                setActiveIndex((index - 1 + successStories.length) % successStories.length);
              }
            }}
            className={`min-h-14 shrink-0 border px-5 text-left font-serif text-2xl transition lg:w-full ${
              activeIndex === index
                ? "border-sahel bg-sahel text-obsidian"
                : "border-papyrus/10 bg-papyrus/[0.03] text-papyrus hover:border-sahel"
            }`}
          >
            {story.name}
          </button>
        ))}
      </div>
      <div
        id="success-panel"
        role="tabpanel"
        className="overflow-hidden border border-papyrus/10 bg-papyrus/[0.035]"
      >
        <AnimatePresence mode="wait">
          <motion.article
            key={active.name}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.45 }}
            className="grid md:grid-cols-[0.8fr_1fr]"
          >
            <div className="relative min-h-[24rem]">
              <Image
                src={active.image}
                alt={active.name}
                fill
                sizes="(min-width: 768px) 42vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 via-transparent" />
            </div>
            <div className="p-7 md:p-10">
              <p className="label">Selected voice</p>
              <h3 className="mt-4 font-serif text-5xl leading-none text-papyrus">
                {active.name}
              </h3>
              <p className="mt-3 text-sahel">{active.role}</p>
              <p className="mt-7 text-base leading-8 text-papyrus/68">{active.bio}</p>
              <div className="mt-8">
                <p className="label text-[0.62rem]">Associated projects</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {active.projects.map((project) => (
                    <span
                      key={project}
                      className="rounded-full border border-papyrus/12 px-3 py-2 text-xs text-papyrus/70"
                    >
                      {project}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
    </div>
  );
}
