import { type ProjectStatus } from "@/lib/content";

const tone: Record<ProjectStatus, string> = {
  Live: "border-sahel/40 bg-sahel/12 text-sahel",
  Upcoming: "border-papyrus/20 bg-papyrus/8 text-papyrus",
  Streaming: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
  "Now Showing": "border-crimson/50 bg-crimson/20 text-papyrus",
  Completed: "border-papyrus/15 bg-papyrus/6 text-papyrus/75",
  "In Production": "border-sand/35 bg-sand/10 text-sand",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 font-label text-[0.65rem] font-bold uppercase tracking-[0.18em] ${tone[status]}`}
    >
      {status}
    </span>
  );
}
