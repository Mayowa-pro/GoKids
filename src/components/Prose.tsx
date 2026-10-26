/** Simple text page layout used by About, Contact and Privacy. */
export function ProsePage({ label, title, intro, children }: { label: string; title: string; intro?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="label">{label}</p>
      <h1 className="mt-2 font-display text-4xl font-bold leading-tight tracking-tight">{title}</h1>
      {intro && <p className="mt-3 max-w-[60ch] text-lg text-muted">{intro}</p>}
      <div className="prose-page mt-8 flex max-w-[66ch] flex-col gap-4 text-base">{children}</div>
    </div>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-4 font-display text-2xl font-semibold">{children}</h2>;
}
