import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type CinematicButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

export function CinematicButton({
  href,
  children,
  variant = "primary",
  className,
}: CinematicButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex min-h-12 items-center justify-center gap-3 rounded-full px-5 py-3 font-label text-xs font-bold uppercase tracking-[0.22em] transition duration-500",
        variant === "primary" &&
          "bg-sahel text-obsidian hover:bg-papyrus focus-visible:bg-papyrus",
        variant === "secondary" &&
          "border border-papyrus/20 bg-papyrus/5 text-papyrus hover:border-sahel hover:text-sahel",
        variant === "ghost" &&
          "border border-transparent text-papyrus hover:border-papyrus/20 hover:bg-papyrus/5",
        className,
      )}
    >
      <span>{children}</span>
      <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  );
}
