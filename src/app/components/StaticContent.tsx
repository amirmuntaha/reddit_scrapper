import type { ReactNode } from "react";

interface StaticPageProps {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}

interface ContentSectionProps {
  id?: string;
  title: string;
  children: ReactNode;
}

export function StaticPage({
  eyebrow,
  title,
  intro,
  children,
}: StaticPageProps) {
  return (
    <article className="mx-auto w-full max-w-4xl px-3 py-10 sm:px-4 sm:py-16">
      <header className="border-b border-gray-800 pb-8 sm:pb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-300">
          {intro}
        </p>
      </header>
      <div className="mt-10 space-y-12 sm:mt-14 sm:space-y-16">{children}</div>
    </article>
  );
}

export function ContentSection({ id, title, children }: ContentSectionProps) {
  return (
    <section id={id} className="scroll-mt-28 space-y-4">
      <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
        {title}
      </h2>
      <div className="space-y-4 text-base leading-7 text-gray-300">
        {children}
      </div>
    </section>
  );
}

export function ContentSubsection({
  title,
  children,
}: Omit<ContentSectionProps, "id">) {
  return (
    <div className="space-y-3 rounded-xl border border-gray-800 bg-gray-900/50 p-5 sm:p-6">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="space-y-3 text-base leading-7 text-gray-300">{children}</div>
    </div>
  );
}

export function BulletList({ children }: { children: ReactNode }) {
  return (
    <ul className="ml-5 list-disc space-y-2 marker:text-orange-400">{children}</ul>
  );
}

export function NumberedList({ children }: { children: ReactNode }) {
  return (
    <ol className="ml-5 list-decimal space-y-3 marker:font-semibold marker:text-orange-400">
      {children}
    </ol>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return (
    <aside className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-5 leading-7 text-orange-100">
      {children}
    </aside>
  );
}
