import type { Metadata } from "next";
import { ContactForm } from "@/components/interactive/contact-form";
import { SectionHeading } from "@/components/section-heading";
import { contact } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Meroestream for film, theatre, documentary, and partnerships.",
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-papyrus pt-36 text-obsidian md:pt-44">
        <div className="container-shell pb-16 md:pb-24">
          <p className="label text-crimson">Contact</p>
          <h1 className="mt-6 max-w-5xl font-serif text-6xl leading-[0.92] md:text-8xl">
            Let&apos;s make something{" "}
            <span className="editorial text-crimson">together</span>
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-8 text-obsidian/68">
            Tell us about a film, documentary, theatre production, partnership,
            or cultural project. The form opens an email draft so no private API
            credentials are needed in this frontend phase.
          </p>
        </div>
      </section>
      <section className="bg-obsidian py-20 md:py-28">
        <div className="container-shell grid gap-12 lg:grid-cols-[1fr_0.8fr]">
          <div className="border border-papyrus/10 bg-papyrus/[0.035] p-6 md:p-8">
            <ContactForm />
          </div>
          <aside className="space-y-8">
            <SectionHeading
              eyebrow="Reach"
              title={
                <>
                  Two bases, <span className="editorial">one audience</span>
                </>
              }
            />
            <div className="space-y-5 text-sm leading-7 text-papyrus/68">
              <p>
                <strong className="text-papyrus">UK:</strong> {contact.ukAddress}
              </p>
              <p>
                <strong className="text-papyrus">Nigeria:</strong>{" "}
                {contact.nigeriaAddress}
              </p>
              <p>
                <strong className="text-papyrus">Telephone:</strong>{" "}
                <a href={`tel:${contact.phone}`} className="hover:text-sahel">
                  {contact.phone}
                </a>
              </p>
              <p>
                <strong className="text-papyrus">Email:</strong>{" "}
                <a href={`mailto:${contact.email}`} className="hover:text-sahel">
                  {contact.email}
                </a>
              </p>
              <p className="text-papyrus/45">
                Alternate address awaiting client confirmation:{" "}
                {contact.alternateEmail}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {contact.reach.map((item) => (
                <span
                  key={item}
                  className="border border-papyrus/10 px-4 py-3 text-sm text-papyrus/65"
                >
                  {item}
                </span>
              ))}
            </div>
            <div className="border border-sahel/25 bg-sahel/10 p-5">
              <p className="label text-[0.62rem]">Script submission policy</p>
              <p className="mt-4 text-sm leading-7 text-papyrus/70">
                Meroestream does not accept unsolicited scripts, treatments,
                story ideas, concepts, or other creative materials. We cannot
                review, respond to, return, or acknowledge unsolicited
                submissions, and any such material will be deleted unread.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
