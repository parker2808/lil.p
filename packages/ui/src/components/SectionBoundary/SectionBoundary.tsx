'use client';

import { ErrorState } from '@portfolio/ui/components/ErrorState/ErrorState';
import { Component, type ReactNode, Suspense } from 'react';

export type SectionBoundaryLabels = {
  error: string;
  retry: string;
  empty: string;
};

type BoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
  isEmpty?: boolean;
  hideWhenEmpty?: boolean;
  onReset?: () => void;
  labels: SectionBoundaryLabels;
  requestId?: string;
};

class SectionErrorCatcher extends Component<
  { children: ReactNode; labels: SectionBoundaryLabels; requestId?: string; onReset?: () => void },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorState
          message={this.props.labels.error}
          requestId={this.props.requestId}
          retryLabel={this.props.labels.retry}
          onRetry={() => {
            this.setState({ error: null });
            this.props.onReset?.();
          }}
        />
      );
    }
    return this.props.children;
  }
}

export function SectionBoundary({
  children,
  fallback,
  isEmpty = false,
  hideWhenEmpty = false,
  onReset,
  labels,
  requestId,
}: BoundaryProps) {
  if (isEmpty && hideWhenEmpty) {
    return null;
  }

  return (
    <SectionErrorCatcher labels={labels} requestId={requestId} onReset={onReset}>
      <Suspense fallback={fallback}>
        {isEmpty ? <p className="text-body text-muted-foreground">{labels.empty}</p> : children}
      </Suspense>
    </SectionErrorCatcher>
  );
}
