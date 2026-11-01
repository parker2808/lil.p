import { Button } from '@portfolio/ui/components/ui/button';
import { cn } from '@portfolio/ui/lib/utils';

export type SaveStatusState = 'idle' | 'saving' | 'saved' | 'offline' | 'conflict';

export function SaveStatus({
  state,
  savedText,
  labels,
  onLoadLatest,
  onOverwrite,
  className,
}: {
  state: SaveStatusState;
  savedText?: string;
  labels: {
    saving: string;
    saved: string;
    offline: string;
    conflict: string;
    loadLatest: string;
    overwrite: string;
  };
  onLoadLatest?: () => void;
  onOverwrite?: () => void;
  className?: string;
}) {
  if (state === 'idle') {
    return null;
  }

  const tone =
    state === 'conflict' || state === 'offline'
      ? 'text-warning'
      : state === 'saved'
        ? 'text-success'
        : 'text-muted-foreground';

  const text =
    state === 'saving'
      ? labels.saving
      : state === 'saved'
        ? (savedText ?? labels.saved)
        : state === 'offline'
          ? labels.offline
          : labels.conflict;

  return (
    <div
      data-slot="save-status"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-busy={state === 'saving'}
      className={cn(
        'redesign-save-status',
        'text-ui-meta flex items-center gap-2',
        tone,
        className,
      )}
    >
      <span>{text}</span>
      {state === 'conflict' ? (
        <>
          <Button type="button" variant="ghost" size="sm" onClick={onLoadLatest}>
            {labels.loadLatest}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onOverwrite}>
            {labels.overwrite}
          </Button>
        </>
      ) : null}
    </div>
  );
}
