export function CaseStudyMeta({ items }: { items: { label: string; value?: string | null }[] }) {
  const filled = items.filter((item) => item.value?.trim());
  if (filled.length < 1) {
    return null;
  }

  return (
    <dl data-slot="case-study-summary" className="case-study-summary">
      {filled.map((item) => (
        <div key={item.label} className="flex flex-col gap-1">
          <dt className="text-eyebrow text-subtle-foreground font-mono uppercase">{item.label}</dt>
          <dd className="text-body">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
