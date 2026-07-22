"use client";

import Image, { type ImageProps } from "next/image";
import { useMemo, useState } from "react";

type DriveImageSource = {
  type: "drive";
  mediaId: string;
};

type UrlImageSource = {
  type?: "url" | "local" | "legacy-remote";
  src: string;
};

type SafeMediaImageProps = Omit<ImageProps, "src" | "alt" | "onError"> & {
  source: DriveImageSource | UrlImageSource;
  alt: string;
  fallbackSrc?: string;
};

const defaultFallback = "/media/fallback-image.svg";

function sourceToSrc(source: SafeMediaImageProps["source"]) {
  if (source.type === "drive") return `/api/media/image/${source.mediaId}`;
  return source.src;
}

export function SafeMediaImage({
  source,
  alt,
  fallbackSrc = defaultFallback,
  unoptimized,
  ...props
}: SafeMediaImageProps) {
  const initialSrc = useMemo(() => sourceToSrc(source), [source]);
  const [src, setSrc] = useState(initialSrc);
  const [usingFallback, setUsingFallback] = useState(false);
  const shouldBypassOptimizer =
    unoptimized || source.type === "drive" || src === fallbackSrc;

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      unoptimized={shouldBypassOptimizer}
      onError={() => {
        if (usingFallback) return;
        if (process.env.NODE_ENV === "development") {
          console.error(`Image failed to load: ${src}`);
        }
        setUsingFallback(true);
        setSrc(fallbackSrc);
      }}
    />
  );
}
