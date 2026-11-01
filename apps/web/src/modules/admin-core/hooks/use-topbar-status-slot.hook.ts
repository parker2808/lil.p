'use client';

import { useSyncExternalStore } from 'react';

export const TOPBAR_STATUS_ID = 'admin-topbar-status';

function subscribe(callback: () => void) {
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
}

function visibleSlot() {
  const slot = document.getElementById(TOPBAR_STATUS_ID);
  return slot?.offsetParent ? slot : null;
}

export function useTopbarStatusSlot(): HTMLElement | null {
  return useSyncExternalStore(subscribe, visibleSlot, () => null);
}
