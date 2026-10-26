import type { AdminAuditLog } from '@portfolio/contracts';
import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import en from '../../../../i18n/locales/en.json';
import { AuditVirtualList } from './AdminInsightsAudit';

function item(id: number): AdminAuditLog {
  return {
    id,
    userId: 1,
    userName: 'Admin',
    action: 'UPDATE',
    entityType: 'project',
    entityId: String(id),
    summary: `Updated project ${id}`,
    createdAt: '2026-10-26T12:00:00.000Z',
  };
}

const clientHeightDesc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight');
const clientWidthDesc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth');

function stubScrollerSize() {
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get() {
      return 384;
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get() {
      return 800;
    },
  });
}

function restoreScrollerSize() {
  if (clientHeightDesc) {
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', clientHeightDesc);
  }
  if (clientWidthDesc) {
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', clientWidthDesc);
  }
}

describe('AuditVirtualList', () => {
  beforeEach(stubScrollerSize);
  afterEach(restoreScrollerSize);

  it('virtualizes 5000 rows instead of mounting every row', () => {
    const items = Array.from({ length: 5000 }, (_, index) => item(index + 1));
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={en}>
        <AuditVirtualList items={items} empty="No activity yet." />
      </NextIntlClientProvider>,
    );
    const list = container.querySelector('[data-slot="audit-list"] > ul');
    expect(list).toHaveStyle({ height: `${5000 * 64}px` });
    expect(container.querySelectorAll('[data-slot="audit-row"]').length).toBeLessThan(5000);
    expect(container.querySelectorAll('[data-slot="audit-row"]').length).toBeGreaterThan(0);
  });
});
