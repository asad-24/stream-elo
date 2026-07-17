import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-obsidian px-6 pt-20">
      <div className="max-w-xl text-center">
        <p className="label">404</p>
        <h1 className="mt-4 font-serif text-5xl text-papyrus">Scene not found</h1>
        <p className="mt-4 text-papyrus/65">
          This page has left the archive or has not been released yet.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-sahel px-6 py-3 font-label text-xs font-bold uppercase tracking-[0.2em] text-obsidian"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}
