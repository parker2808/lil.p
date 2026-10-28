import { Skeleton } from '@portfolio/ui/components/ui/skeleton';

export function PageSkeleton({
  variant = 'page',
}: {
  variant?: 'page' | 'grid' | 'article' | 'admin' | 'editor';
}) {
  return (
    <div
      aria-busy="true"
      data-slot="page-skeleton"
      className={
        variant === 'admin' || variant === 'editor'
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
