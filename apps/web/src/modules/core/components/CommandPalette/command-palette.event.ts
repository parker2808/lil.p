export const OPEN_COMMAND_PALETTE = 'command-palette:open';

export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_COMMAND_PALETTE));
}
