import { Fragment, jsx as reactJsx, jsxs as reactJsxs } from 'react/jsx-runtime';

import { LocalizedElement, LocalizedFragment } from './runtime';

export { Fragment };
export type { JSX } from 'react/jsx-runtime';

export const jsx: typeof reactJsx = (type, props, key) =>
  typeof type === 'string'
    ? reactJsx(LocalizedElement, { tag: type, elementProps: props }, key)
    : type === Fragment
      ? reactJsx(LocalizedFragment, props, key)
      : reactJsx(type, props, key);

export const jsxs: typeof reactJsxs = (type, props, key) =>
  typeof type === 'string'
    ? reactJsxs(LocalizedElement, { tag: type, elementProps: props }, key)
    : type === Fragment
      ? reactJsxs(LocalizedFragment, props, key)
      : reactJsxs(type, props, key);
