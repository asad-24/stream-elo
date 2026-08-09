"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type HeroVideo = { id: string; url: string; title: string };

export function HeroVideoPlaylist({ videos, fallbackUrl, posterUrl }: { videos: HeroVideo[]; fallbackUrl: string; posterUrl: string }) {
  const [index, setIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playlist = videos.length ? videos : [{ id: "fallback", url: fallbackUrl, title: "Hero background" }];
  const current = playlist[index % playlist.length];
  const next = playlist[(index + 1) % playlist.length];
  const advance = () => setIndex((value) => (value + 1) % playlist.length);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    void video.play().catch(() => undefined);
  }, [current.id]);

  return <div className="absolute inset-0 overflow-hidden bg-obsidian" aria-hidden="true">
    <AnimatePresence initial={false} mode="sync">
      <motion.video
        ref={videoRef}
        key={current.id}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop={playlist.length === 1}
        playsInline
        preload="auto"
        poster={posterUrl}
        onEnded={playlist.length > 1 ? advance : undefined}
        onError={playlist.length > 1 ? advance : undefined}
        initial={{ opacity: 0, scale: 1.015 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.01 }}
        transition={{ opacity: { duration: 1.35, ease: "easeInOut" }, scale: { duration: 1.8, ease: "easeOut" } }}
      >
        <source src={current.url} type="video/mp4" />
      </motion.video>
    </AnimatePresence>
    {playlist.length > 1 ? <video key={`preload-${next.id}`} src={next.url} muted playsInline preload="auto" className="pointer-events-none absolute h-px w-px opacity-0" tabIndex={-1} /> : null}
  </div>;
}
