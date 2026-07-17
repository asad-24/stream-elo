"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Play, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { type VideoSource } from "@/lib/content";
import { youtubeEmbedUrl } from "@/lib/utils";

export function VideoModal({
  video,
  title,
  compact,
}: {
  video: VideoSource;
  title: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const titleId = useId();

  function openVideo() {
    setLoaded(false);
    setVideoError(false);
    setOpen(true);
  }

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
      <button
        type="button"
        onClick={openVideo}
        className={
          compact
            ? "inline-flex h-12 w-12 items-center justify-center rounded-full bg-sahel text-obsidian transition hover:bg-papyrus"
            : "inline-flex min-h-12 items-center gap-3 rounded-full bg-sahel px-5 py-3 font-label text-xs font-bold uppercase tracking-[0.2em] text-obsidian transition hover:bg-papyrus"
        }
        aria-label={`Play ${title}`}
      >
        <Play className="h-4 w-4 fill-current" />
        {!compact ? <span>{video.label}</span> : null}
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[80] grid place-items-center bg-black/86 p-4 backdrop-blur-lg"
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
              className="w-full max-w-5xl"
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 id={titleId} className="font-serif text-3xl text-papyrus">
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-papyrus/20 text-papyrus"
                  aria-label="Close video"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="relative aspect-video overflow-hidden rounded-md border border-papyrus/10 bg-black">
                {video.type === "youtube" ? (
                  <iframe
                    src={youtubeEmbedUrl(video.url)}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    onLoad={() => setLoaded(true)}
                    className="h-full w-full"
                  />
                ) : (
                  <video
                    controls
                    autoPlay
                    playsInline
                    onCanPlay={() => setLoaded(true)}
                    onError={() => setVideoError(true)}
                    className="h-full w-full"
                  >
                    <source
                      src={video.url}
                      type={
                        video.type === "hls"
                          ? "application/x-mpegURL"
                          : "video/mp4"
                      }
                    />
                  </video>
                )}
                {!loaded && !videoError ? (
                  <div className="absolute inset-0 grid place-items-center bg-black text-sm text-papyrus/70">
                    Loading video...
                  </div>
                ) : null}
                {videoError ? (
                  <div className="absolute inset-0 grid place-items-center bg-black p-6 text-center text-sm text-papyrus/70">
                    This video could not be loaded. Please try again later.
                  </div>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
