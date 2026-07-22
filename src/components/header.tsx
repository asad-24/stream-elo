"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navigation } from "@/lib/content";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-papyrus/10 bg-obsidian/74 backdrop-blur-xl">
      <div className="container-shell flex h-20 items-center justify-between gap-6">
        <Link href="/" className="group flex items-baseline gap-1">
          <span className="font-serif text-2xl text-sahel transition group-hover:text-papyrus">
            meroe
          </span>
          <span className="font-serif text-2xl italic text-papyrus/70">
            Stream
          </span>
        </Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-3 py-2 font-label text-[0.68rem] font-bold uppercase tracking-[0.16em] text-papyrus/64 transition hover:bg-papyrus/8 hover:text-sahel",
                pathname === item.href && "bg-papyrus/8 text-sahel",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/contact"
          aria-label="Partner with Meroestream"
          className="hidden min-h-11 items-center rounded-full border border-sahel/70 bg-sahel px-5 font-label text-[0.68rem] font-bold uppercase tracking-[0.2em] text-obsidian shadow-[0_0_24px_rgba(232,180,74,0.18)] transition hover:bg-papyrus hover:text-obsidian lg:inline-flex"
        >
          Partner
        </Link>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-papyrus/20 text-papyrus lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      <div
        id="mobile-menu"
        className={cn(
          "grid overflow-hidden border-t border-papyrus/10 bg-obsidian transition-[grid-template-rows] duration-500 lg:hidden",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <nav
          aria-label="Mobile navigation"
          className="container-shell min-h-0 space-y-1 py-5"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center justify-between border-b border-papyrus/10 font-serif text-3xl text-papyrus"
            >
              {item.label}
              <span className="font-label text-xs text-sahel">Open</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
