'use client';

import { createContext, useContext, type ReactNode } from 'react';

const DemoModeContext = createContext(false);

export function DemoModeProvider({ children }: { children: ReactNode }) {
  return <DemoModeContext.Provider value>{children}</DemoModeContext.Provider>;
}

export function useDemoMode() {
  return useContext(DemoModeContext);
}
