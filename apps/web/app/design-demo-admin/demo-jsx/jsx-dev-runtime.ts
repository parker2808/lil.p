import { Fragment, jsxDEV as reactJsxDEV } from 'react/jsx-dev-runtime';

import { LocalizedElement, LocalizedFragment } from './runtime';

export { Fragment };
export type { JSX } from 'react/jsx-dev-runtime';

export const jsxDEV: typeof reactJsxDEV = (type, props, key, isStaticChildren, source, self) =>
  typeof type === 'string'
    ? reactJsxDEV(
        LocalizedElement,
        { tag: type, elementProps: props },
        key,
        isStaticChildren,
        source,
        self,
      )
    : type === Fragment
      ? reactJsxDEV(LocalizedFragment, props, key, isStaticChildren, source, self)
      : reactJsxDEV(type, props, key, isStaticChildren, source, self);
