"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="grid min-h-screen place-items-center bg-obsidian px-6 pt-20">
      <div className="max-w-xl text-center">
        <p className="label">Error</p>
        <h1 className="mt-4 font-serif text-5xl text-papyrus">The reel broke.</h1>
        <p className="mt-4 text-papyrus/65">
          Something interrupted this scene. Try again and we will reload the
          experience.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 rounded-full bg-sahel px-6 py-3 font-label text-xs font-bold uppercase tracking-[0.2em] text-obsidian"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
