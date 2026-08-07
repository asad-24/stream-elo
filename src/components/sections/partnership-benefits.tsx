import { partnershipBenefits } from "@/lib/content";
import { SectionHeading } from "@/components/section-heading";

export function PartnershipBenefits({ items = partnershipBenefits, heading }: { items?: typeof partnershipBenefits; heading?: { eyebrow: string; title: string; intro: string } }) {
  return (
    <section className="bg-papyrus py-20 text-obsidian md:py-28">
      <div className="container-shell">
        <SectionHeading
          eyebrow={heading?.eyebrow ?? "Partnership"}
          title={
            <>
              {heading?.title ?? <>Cultural weight, <span className="editorial text-crimson">real reach</span></>}
            </>
          }
          intro={heading?.intro ?? "Brands and institutions partner with Meroestream to support original African stories while meeting audiences with purpose."}
          className="[&_.label]:text-crimson [&_h2]:text-obsidian [&_p]:text-obsidian/65"
        />
        <div className="mt-12 grid gap-px overflow-hidden border border-obsidian/10 bg-obsidian/10 md:grid-cols-2 xl:grid-cols-4">
          {items.map((benefit) => (
            <article key={benefit.title} className="bg-papyrus p-6 md:p-8">
              <p className="font-serif text-3xl italic text-crimson">{benefit.label}</p>
              <h3 className="mt-8 font-display text-lg font-semibold uppercase tracking-wide">
                {benefit.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-obsidian/65">{benefit.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
