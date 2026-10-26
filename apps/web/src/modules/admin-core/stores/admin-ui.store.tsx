'use client';

import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

type AdminUiState = {
  collapsed: boolean;
  paletteOpen: boolean;
  setCollapsed: (value: boolean) => void;
  toggleCollapsed: () => void;
  setPaletteOpen: (value: boolean) => void;
};

const AdminUiContext = createContext<AdminUiState | null>(null);

export function AdminUiProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const value = useMemo(
    () => ({
      collapsed,
      paletteOpen,
      setCollapsed,
      toggleCollapsed: () => setCollapsed((current) => !current),
      setPaletteOpen,
    }),
    [collapsed, paletteOpen],
  );
  return <AdminUiContext.Provider value={value}>{children}</AdminUiContext.Provider>;
}

export function useAdminUi(): AdminUiState {
  const value = useContext(AdminUiContext);
  if (!value) {
    throw new Error('useAdminUi must be used inside AdminUiProvider');
  }
  return value;
}
