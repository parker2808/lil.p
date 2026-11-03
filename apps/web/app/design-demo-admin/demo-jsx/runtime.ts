'use client';

import { createContext, createElement, Fragment, useContext, type ReactNode } from 'react';

import { translateDemoString, type DemoLocale } from '../demo-i18n';

export const DemoLocaleContext = createContext<DemoLocale>('en');

export function DemoLocaleProvider({
  locale,
  children,
}: {
  locale: DemoLocale;
  children: ReactNode;
}) {
  return createElement(DemoLocaleContext.Provider, { value: locale }, children);
}

function localizeChildren(value: ReactNode, locale: DemoLocale): ReactNode {
  if (typeof value === 'string') return translateDemoString(value, locale);
  if (Array.isArray(value)) return value.map((item) => localizeChildren(item, locale));
  return value;
}

export function LocalizedElement({
  tag,
  elementProps,
}: {
  tag: string;
  elementProps: Record<string, unknown>;
}) {
  const locale = useContext(DemoLocaleContext);
  const props = { ...elementProps };
  for (const name of ['aria-label', 'title', 'placeholder']) {
    if (typeof props[name] === 'string') {
      props[name] = translateDemoString(props[name], locale);
    }
  }
  if ('children' in props) props.children = localizeChildren(props.children as ReactNode, locale);
  return createElement(tag, props);
}

export function LocalizedFragment({ children }: { children: ReactNode }) {
  const locale = useContext(DemoLocaleContext);
  return createElement(Fragment, null, localizeChildren(children, locale));
}
