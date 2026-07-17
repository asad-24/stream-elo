import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  title: React.ReactNode;
  intro?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <p className="label">{eyebrow}</p>
      <h2 className="mt-5 font-serif text-5xl leading-[0.95] text-papyrus md:text-7xl">
        {title}
      </h2>
      {intro ? (
        <p className="mt-6 max-w-2xl text-base leading-8 text-papyrus/68 md:text-lg">
          {intro}
        </p>
      ) : null}
    </div>
  );
}
