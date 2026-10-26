import { createElement, type ReactNode } from 'react';

export type RenderLink = (props: {
  href: string;
  children: ReactNode;
  className?: string;
}) => ReactNode;

export function defaultRenderLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return createElement('a', { href, className }, children);
}
