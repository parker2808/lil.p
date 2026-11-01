import { Skeleton } from '@portfolio/ui/components/ui/skeleton';

export default function Loading() {
  return (
    <div aria-busy="true" data-slot="projects-skeleton">
      <div className="site-container public-block grid gap-6">
        <header className="col-span-full mx-auto flex w-full max-w-3xl flex-col gap-3 py-12">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="text-title h-[1lh] w-2/3" />
          <Skeleton className="h-6 w-3/4" />
        </header>
      </div>
      <div className="site-container public-block grid gap-6 md:grid-cols-2">
        <div className="projects-filters col-span-full flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-[30px] w-3/4 md:w-1/2" />
          <Skeleton className="h-[30px] w-28" />
        </div>
        <div className="projects-view col-span-full">
          <div className="view-switch" aria-hidden="true">
            <Skeleton className="h-[34px] w-32" />
          </div>
          <div className="projects-results grid gap-6 md:grid-cols-2">
            <div className="redesign-case-card col-span-full p-4 lg:p-5">
              <div className="grid gap-6 lg:grid-cols-12">
                <Skeleton className="aspect-[16/10] w-full lg:col-span-7" />
                <div className="flex flex-col gap-3 lg:col-span-5">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </div>
            {Array.from({ length: 2 }, (_, index) => (
              <div key={index} className="redesign-case-card">
                <Skeleton className="aspect-[16/10] w-full" />
                <div className="flex flex-col gap-3 p-4">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
