export function CaseStudyMeta({ items }: { items: { label: string; value: string }[] }) {
  if (items.length < 1) {
    return null;
  }

  return (
    <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-1">
          <dt className="text-eyebrow text-subtle-foreground font-mono uppercase">{item.label}</dt>
          <dd className="text-body">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
