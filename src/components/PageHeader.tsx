// The dark opening of a page that has no 3D chapter of its own.
// With `fill` it takes up whatever height the page has left, for a page with nothing below it.
export default function PageHeader({
  eyebrow,
  title,
  fill,
  children,
}: {
  eyebrow: React.ReactNode;
  title: string;
  fill?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section className={`stage-bg ${fill ? "grow" : ""}`}>
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-36 sm:px-8 lg:pb-24 lg:pt-48">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-plum-300">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl">{title}</h1>
        {children && (
          <div className="mt-5 max-w-xl text-base leading-relaxed text-cream/75 sm:text-lg">{children}</div>
        )}
      </div>
    </section>
  );
}
