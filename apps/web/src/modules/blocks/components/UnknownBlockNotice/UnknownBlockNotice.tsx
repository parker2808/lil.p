import type { InvalidPreviewBlock } from '@portfolio/contracts';

export function UnknownBlockNotice({
  block,
  labels,
}: {
  block: InvalidPreviewBlock;
  labels: { unknown: string };
}) {
  return (
    <div
      data-block-id={block.id}
      className="border-border bg-muted text-muted-foreground rounded-md border border-dashed p-6"
    >
      <p className="text-ui font-medium">{labels.unknown}</p>
      <p className="text-ui-meta font-mono">{block.type}</p>
      <ul className="mt-2 flex flex-col gap-1">
        {block.issues.map((issue) => (
          <li key={issue} className="text-ui-meta">
            {issue}
          </li>
        ))}
      </ul>
    </div>
  );
}
