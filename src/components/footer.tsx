import Link from "next/link";
import { contact, navigation } from "@/lib/content";

export function Footer() {
  return (
    <footer className="border-t border-papyrus/10 bg-[#080705]">
      <div className="container-shell py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Link href="/" className="font-serif text-3xl text-sahel">
              Mero<span className="italic text-papyrus/70">Stream</span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-7 text-papyrus/62">
              African cinema and live theatre rooted in tradition, speaking to
              audiences across the world.
            </p>
          </div>
          <div>
            <p className="label">Navigate</p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-papyrus/70">
              {navigation.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-sahel">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="label">Contact</p>
            <div className="mt-5 space-y-3 text-sm leading-6 text-papyrus/70">
              <a href={`mailto:${contact.email}`} className="block hover:text-sahel">
                {contact.email}
              </a>
              <a href={`tel:${contact.phone}`} className="block hover:text-sahel">
                {contact.phone}
              </a>
              <p>{contact.ukAddress}</p>
              <p>{contact.nigeriaAddress}</p>
            </div>
          </div>
        </div>
        <div className="fine-line mt-12" />
        <div className="mt-6 flex flex-col gap-3 font-label text-[0.65rem] uppercase tracking-[0.18em] text-papyrus/45 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} MeroStream</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2"><Link href="/privacy-cookies-policy" className="hover:text-sahel">Privacy &amp; Cookies</Link><Link href="/sustainability-environmental-policy" className="hover:text-sahel">Sustainability</Link></div>
          <p>Film · Documentary · Theatre · Music</p>
        </div>
      </div>
    </footer>
  );
}
