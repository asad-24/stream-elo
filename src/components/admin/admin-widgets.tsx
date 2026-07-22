import Link from "next/link";
import { type ReactNode } from "react";

export function AdminCard({
  title,
  eyebrow,
  children,
  action,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="border border-papyrus/10 bg-papyrus/[0.035] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {eyebrow ? <p className="label">{eyebrow}</p> : null}
          <h2 className="mt-2 font-serif text-3xl leading-tight text-papyrus">
            {title}
          </h2>
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function AdminLinkButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center rounded-full border border-sahel/55 px-4 font-label text-xs font-bold uppercase tracking-[0.18em] text-sahel transition hover:bg-sahel hover:text-obsidian"
    >
      {children}
    </Link>
  );
}

export function AdminStatGrid({
  cards,
}: {
  cards: Array<{ label: string; value: number | string }>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className="border border-papyrus/10 bg-papyrus/[0.035] p-5"
        >
          <p className="text-sm text-papyrus/55">{card.label}</p>
          <p className="mt-3 font-serif text-5xl leading-none text-sahel">
            {card.value}
          </p>
        </article>
      ))}
    </div>
  );
}

export function StatusPill({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const tone =
    normalized.includes("ready") ||
    normalized.includes("published") ||
    normalized === "yes" ||
    normalized === "mongodb"
      ? "border-emerald-400/35 bg-emerald-400/10 text-emerald-100"
      : normalized.includes("missing") ||
          normalized.includes("failed") ||
          normalized === "no"
        ? "border-red-400/35 bg-red-400/10 text-red-100"
        : "border-sahel/35 bg-sahel/10 text-sahel";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 font-label text-[0.68rem] font-bold uppercase tracking-[0.16em] ${tone}`}
    >
      {value}
    </span>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="border border-dashed border-papyrus/15 bg-obsidian/40 p-6">
      <h3 className="font-serif text-2xl text-papyrus">{title}</h3>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-papyrus/58">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function AdminTable({
  columns,
  rows,
  empty,
}: {
  columns: string[];
  rows: ReactNode[][];
  empty: ReactNode;
}) {
  if (!rows.length) return <>{empty}</>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-papyrus/10 text-papyrus/45">
            {columns.map((column) => (
              <th
                key={column}
                className="whitespace-nowrap px-3 py-3 font-label text-[0.68rem] font-bold uppercase tracking-[0.16em]"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-papyrus/8">
              {row.map((cell, cellIndex) => (
                <td
                  key={`${rowIndex}-${cellIndex}`}
                  className="max-w-[22rem] px-3 py-4 align-top text-papyrus/72"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminNotice({
  tone = "info",
  children,
}: {
  tone?: "info" | "warning" | "error";
  children: ReactNode;
}) {
  const styles = {
    info: "border-papyrus/10 bg-papyrus/[0.035] text-papyrus/65",
    warning: "border-sahel/25 bg-sahel/10 text-sahel",
    error: "border-red-400/30 bg-red-500/10 text-red-100",
  };

  return (
    <div className={`border p-4 text-sm leading-7 ${styles[tone]}`}>
      {children}
    </div>
  );
}
