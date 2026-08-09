import Image from "next/image";

export function FittedCoverImage({ src, alt, sizes, className = "", unoptimized = false, priority = false }: { src: string; alt: string; sizes: string; className?: string; unoptimized?: boolean; priority?: boolean }) {
  return <>
    <Image src={src} alt="" fill sizes={sizes} aria-hidden unoptimized={unoptimized} className="scale-110 object-cover opacity-35 blur-xl" />
    <Image src={src} alt={alt} fill sizes={sizes} unoptimized={unoptimized} priority={priority} className={`object-contain p-1 transition duration-700 ${className}`} />
  </>;
}
