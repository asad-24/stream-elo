import { type ReactNode } from "react";

export function AdminPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <section>
      <p className="label">{eyebrow}</p>
      <h1 className="mt-3 font-serif text-4xl leading-tight text-papyrus md:text-5xl">
        {title}
      </h1>
      {intro ? <p className="mt-4 max-w-3xl text-papyrus/60">{intro}</p> : null}
      <div className="mt-8">{children}</div>
    </section>
  );
}
