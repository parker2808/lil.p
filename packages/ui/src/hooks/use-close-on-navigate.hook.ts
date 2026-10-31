import { useEffect, useRef, useState } from 'react';

/**
 * Wraps a controlled overlay `open` state (Dialog, Sheet, Drawer) and closes it
 * whenever the given pathname changes, so mobile menus never survive
 * client-side navigation. Pass the value your navigation router reports, e.g.
 * `useCloseOnNavigate(usePathname())`.
 */
export function useCloseOnNavigate(pathname: string): {
  open: boolean;
  onOpenChange: (open: boolean) => void;
} {
  const [open, setOpen] = useState(false);
  const previous = useRef<string | null>(null);

  useEffect(() => {
    if (previous.current !== null && previous.current !== pathname) {
      setOpen(false);
    }
    previous.current = pathname;
  }, [pathname]);

  return { open, onOpenChange: setOpen };
}
