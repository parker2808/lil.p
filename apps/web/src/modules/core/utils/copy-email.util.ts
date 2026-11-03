/** Copies a configured address without logging it or leaving a temporary field behind. */
export async function copyEmail(email: string | null | undefined): Promise<boolean> {
  const value = email?.trim();
  if (!value) return false;

  if (window.isSecureContext && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Permission can be denied even in a secure context. Try the selection path.
    }
  }

  const field = document.createElement('textarea');
  const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  field.value = value;
  field.readOnly = true;
  field.setAttribute('aria-hidden', 'true');
  field.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0';
  document.body.append(field);
  try {
    field.focus();
    field.select();
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    field.remove();
    active?.focus();
  }
}
