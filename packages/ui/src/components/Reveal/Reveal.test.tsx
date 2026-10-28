import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';

import { Reveal } from './Reveal';

it('ships readable content before hydration', () => {
  const html = renderToStaticMarkup(
    <Reveal>
      <p>Readable without JavaScript</p>
    </Reveal>,
  );
  expect(html).toContain('Readable without JavaScript');
  expect(html).not.toContain('opacity-0');
});
