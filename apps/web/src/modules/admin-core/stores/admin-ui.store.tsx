'use client';

import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

type PublishAction = () => void;

type AdminUiState = {
  collapsed: boolean;
  paletteOpen: boolean;
  publishAction: PublishAction | null;
  setCollapsed: (value: boolean) => void;
  toggleCollapsed: () => void;
  setPaletteOpen: (value: boolean) => void;
  setPublishAction: Dispatch<SetStateAction<PublishAction | null>>;
};

const AdminUiContext = createContext<AdminUiState | null>(null);

export function AdminUiProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [publishAction, setPublishAction] = useState<PublishAction | null>(null);
  const value = useMemo(
    () => ({
      collapsed,
      paletteOpen,
      publishAction,
      setCollapsed,
      toggleCollapsed: () => setCollapsed((current) => !current),
      setPaletteOpen,
      setPublishAction,
    }),
    [collapsed, paletteOpen, publishAction],
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

export function usePublishAction(onPublish: PublishAction, enabled: boolean): void {
  const setPublishAction = useContext(AdminUiContext)?.setPublishAction;
  const latest = useRef(onPublish);
  useEffect(() => {
    latest.current = onPublish;
  });
  useEffect(() => {
    if (!enabled || !setPublishAction) {
      return;
    }
    const action = () => latest.current();
    setPublishAction(() => action);
    return () => setPublishAction((current) => (current === action ? null : current));
  }, [enabled, setPublishAction]);
}
