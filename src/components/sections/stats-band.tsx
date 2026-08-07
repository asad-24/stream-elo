import { stats } from "@/lib/content";
import { AnimatedCounter } from "@/components/interactive/animated-counter";

export function StatsBand({ items = stats }: { items?: typeof stats }) {
  return (
    <section className="border-y border-papyrus/10 bg-[#090705] py-12">
      <div className="container-shell grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <AnimatedCounter key={item.label} {...item} />
        ))}
      </div>
    </section>
  );
}
