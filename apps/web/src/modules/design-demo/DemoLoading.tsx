import { Skeleton } from '@portfolio/ui/components/ui/skeleton';

export function DemoLoading({ variant }: { variant: 'home' | 'projects' | 'detail' | 'craft' }) {
  const cards = variant === 'craft' ? 4 : variant === 'home' ? 3 : 4;
  return (
    <div className="demo-container demo-loading" aria-busy="true">
      <div className="demo-loading-heading">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-20 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
      </div>
      {variant === 'detail' ? (
        <>
          <Skeleton className="aspect-[21/9] w-full rounded-[22px]" />
          <div className="demo-loading-story">
            <Skeleton className="h-56 w-1/4" />
            <Skeleton className="h-96 w-3/4" />
          </div>
        </>
      ) : (
        <div className="demo-loading-cards">
          {Array.from({ length: cards }, (_, index) => (
            <div className="demo-loading-card" key={index}>
              <Skeleton className="aspect-[16/10] w-full" />
              <div>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
