"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Images, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

type IntroGalleryItem = {
  src: string;
  alt: string;
};

function GalleryImage({ image, priority }: { image: IntroGalleryItem; priority?: boolean }) {
  return (
    <Image
      src={image.src}
      alt={image.alt}
      fill
      unoptimized
      priority={priority}
      sizes="(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 50vw"
      className="object-cover"
    />
  );
}

export function IntroGallery({ images }: { images: IntroGalleryItem[] }) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const previewImages = images.slice(0, 2);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className="overflow-hidden border border-papyrus/10 bg-papyrus/[0.035]">
        <div className="grid grid-cols-2 gap-3 p-3">
          {previewImages.map((item, index) => (
            <div
              key={`${item.src}-${index}`}
              className="relative aspect-[3/4] overflow-hidden bg-obsidian"
            >
              <GalleryImage image={item} priority={index === 0} />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4 border-t border-papyrus/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <div>
            <p className="label">New release</p>
            <p className="mt-2 font-serif text-3xl leading-tight text-papyrus md:text-4xl">
              The Iron River - Now streaming
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-sahel/70 px-5 font-label text-xs font-bold uppercase tracking-[0.18em] text-sahel transition hover:bg-sahel hover:text-obsidian"
          >
            <Images className="h-4 w-4" />
            <span>View all</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[90] grid place-items-center bg-black/88 p-4 backdrop-blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="max-h-[92svh] w-full max-w-6xl overflow-y-auto"
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 id={titleId} className="font-serif text-3xl text-papyrus">
                  New release gallery
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-papyrus/20 text-papyrus"
                  aria-label="Close gallery"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {images.map((item, index) => (
                  <div
                    key={`${item.src}-${index}`}
                    className="relative aspect-[3/4] overflow-hidden border border-papyrus/10 bg-obsidian"
                  >
                    <GalleryImage image={item} />
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
