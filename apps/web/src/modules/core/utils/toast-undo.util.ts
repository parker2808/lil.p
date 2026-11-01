import { toast } from 'sonner';

export function toastUndo(message: string, onUndo: () => void) {
  return toast(message, {
    duration: 5000,
    action: { label: 'Undo', onClick: onUndo },
  });
}
