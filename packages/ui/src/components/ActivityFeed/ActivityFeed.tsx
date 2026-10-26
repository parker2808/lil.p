import type { ReactNode } from 'react';

export function ActivityFeed({ children, empty }: { children?: ReactNode; empty: ReactNode }) {
  if (!children) {
    return <div data-slot="activity-feed">{empty}</div>;
  }
  return (
    <ul data-slot="activity-feed" className="divide-border flex flex-col divide-y">
      {children}
    </ul>
  );
}
