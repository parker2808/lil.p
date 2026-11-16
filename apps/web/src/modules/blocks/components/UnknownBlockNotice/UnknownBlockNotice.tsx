import type { InvalidPreviewBlock } from '@portfolio/contracts';

export function UnknownBlockNotice({
  block,
  labels,
}: {
  block: InvalidPreviewBlock;
  labels: { unknown: string; help?: string };
}) {
  return (
    <div
      role="status"
      data-block-id={block.id}
      className="border-border bg-muted text-muted-foreground rounded-md border border-dashed p-6"
    >
      <p className="text-ui font-medium">{labels.unknown}</p>
      {labels.help && <p className="text-ui-meta mt-2">{labels.help}</p>}
    </div>
  );
}
