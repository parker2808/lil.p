'use client';

import type { Me } from '@portfolio/contracts';
import { createContext, type ReactNode, useContext } from 'react';

const MeContext = createContext<Me | null>(null);

export function MeProvider({ me, children }: { me: Me; children: ReactNode }) {
  return <MeContext.Provider value={me}>{children}</MeContext.Provider>;
}

export function useMe(): Me {
  const me = useContext(MeContext);
  if (!me) {
    throw new Error('useMe must be used inside MeProvider');
  }
  return me;
}

export function useIsAdmin(): boolean {
  return useMe().role === 'admin';
}
