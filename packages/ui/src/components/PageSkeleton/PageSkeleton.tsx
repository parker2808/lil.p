import { Skeleton } from '@portfolio/ui/components/ui/skeleton';

export function PageSkeleton({
  variant = 'page',
}: {
  variant?: 'page' | 'grid' | 'article' | 'admin' | 'editor' | 'table';
}) {
  return (
    <div
      aria-busy="true"
      data-slot="page-skeleton"
      className={
        variant === 'admin' || variant === 'editor' || variant === 'table'
          ? 'flex flex-col gap-6'
          : 'site-container public-block flex flex-col gap-8'
      }
    >
      <Skeleton className="h-4 w-28" />
      <Skeleton className="text-title h-[1lh] w-3/4" />
      <Skeleton className="h-5 w-1/2" />
      {variant === 'article' ? (
        <>
          <Skeleton className="aspect-[21/9] w-full" />
          <div className="grid gap-3">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className={i % 3 === 2 ? 'h-5 w-2/3' : 'h-5 w-full'} />
            ))}
          </div>
        </>
      ) : variant === 'table' ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-8 w-full max-w-64" />
            <Skeleton className="h-8 w-24 shrink-0" />
          </div>
          <div className="flex flex-col gap-px overflow-hidden rounded-lg border">
            <Skeleton className="h-9 rounded-none" />
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <Skeleton className="h-5 flex-[3]" />
                <Skeleton className="h-5 flex-[2]" />
                <Skeleton className="hidden h-5 flex-1 sm:block" />
              </div>
            ))}
          </div>
        </div>
      ) : variant === 'editor' ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: variant === 'admin' ? 6 : 3 }, (_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <Skeleton className={variant === 'admin' ? 'h-28' : 'aspect-[16/10]'} />
              <Skeleton className="h-6 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
