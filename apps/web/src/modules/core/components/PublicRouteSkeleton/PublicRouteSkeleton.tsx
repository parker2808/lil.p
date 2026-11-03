import { Skeleton } from '@portfolio/ui/components/ui/skeleton';

type Variant = 'home' | 'projects' | 'notes' | 'about' | 'contact' | 'craft' | 'project' | 'note';

export function PublicRouteSkeleton({ variant }: { variant: Variant }) {
  const detail = variant === 'project' || variant === 'note';
  const cards = variant === 'craft' ? 4 : 3;

  return (
    <div className={`public-route-skeleton public-route-skeleton-${variant}`} aria-busy="true">
      <div className="site-container public-skeleton-heading">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-16 w-3/4 max-w-2xl" />
        <Skeleton className="h-5 w-1/2 max-w-xl" />
      </div>
      {detail ? (
        <div className="site-container public-skeleton-detail">
          {variant === 'project' ? <Skeleton className="h-24 w-full rounded-xl" /> : null}
          {variant === 'project' ? <Skeleton className="aspect-[21/9] w-full rounded-xl" /> : null}
          <div className="public-skeleton-columns">
            <Skeleton className="h-56 w-full rounded-xl" />
            <div className="grid gap-4">
              {Array.from({ length: 7 }, (_, index) => (
                <Skeleton key={index} className={index % 3 === 2 ? 'h-5 w-2/3' : 'h-5 w-full'} />
              ))}
            </div>
          </div>
        </div>
      ) : variant === 'about' || variant === 'contact' ? (
        <div className="site-container public-skeleton-columns public-skeleton-panels">
          <Skeleton className="h-96 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      ) : variant === 'notes' ? (
        <div className="site-container public-skeleton-notes">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index}>
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="site-container public-skeleton-cards">
          {Array.from({ length: cards }, (_, index) => (
            <div className="public-skeleton-card" key={index}>
              <Skeleton className="aspect-[16/10] w-full rounded-lg" />
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
